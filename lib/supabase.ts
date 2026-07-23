/**
 * Neon compatibility shim
 * Provides a supabase-like API surface backed by Neon PostgreSQL.
 *
 * Uses a proven pattern: split SQL text on $1/$2/... placeholders to build
 * a fake TemplateStringsArray, which neon() accepts for parameterized queries.
 * This is safe (no string interpolation of user values) and works on web + native.
 */
import { neon, neonConfig } from '@neondatabase/serverless';
import { getStoredSession } from './auth';

neonConfig.fetchFunction = fetch;

const databaseUrl = process.env.EXPO_PUBLIC_NEON_DATABASE_URL || '';
const sql = neon(databaseUrl);

type OrderOptions = { ascending?: boolean };
type FilterValue = string | number | boolean | null;

/**
 * Execute a parameterized SQL query safely.
 * Splits the text on $1, $2, ... to build a TemplateStringsArray for neon().
 */
async function runQuery<T = any>(text: string, values: any[]): Promise<T[]> {
  const parts = text.split(/\$\d+/);
  const arr: any = [...parts];
  arr.raw = [...parts];
  return (await sql(arr as TemplateStringsArray, ...values)) as T[];
}

// ─── QueryBuilder ─────────────────────────────────────────────────────────────

class QueryBuilder<T = any> {
  private table: string;
  private _select: string = '*';
  private _filters: string[] = [];
  private _values: any[] = [];
  private _order: string | null = null;
  private _limit: number | null = null;
  private _range: [number, number] | null = null;
  private _single = false;
  private _countOnly = false;

  constructor(table: string) {
    this.table = table;
  }

  select(columns: string = '*', opts?: { count?: string; head?: boolean }) {
    this._select = this.parseSelect(columns);
    if (opts?.count === 'exact') this._countOnly = true;
    return this;
  }

  private parseSelect(columns: string): string {
    if (columns.trim() === '*') return '*';
    return (
      columns
        .split(',')
        .map((c) => {
          const trimmed = c.trim();
          if (trimmed.includes('(')) return null; // skip nested relation syntax
          const alias = trimmed.split(':')[0].trim();
          return alias === '*' ? '*' : alias;
        })
        .filter(Boolean)
        .join(', ') || '*'
    );
  }

  insert(data: Partial<T> | Partial<T>[]) {
    return new InsertBuilder<T>(this.table, data);
  }

  update(data: Partial<T>) {
    return new UpdateBuilder<T>(this.table, data);
  }

  delete() {
    return new DeleteBuilder<T>(this.table);
  }

  eq(column: string, value: FilterValue) {
    this._values.push(value);
    this._filters.push(`${column} = $${this._values.length}`);
    return this;
  }

  neq(column: string, value: FilterValue) {
    this._values.push(value);
    this._filters.push(`${column} != $${this._values.length}`);
    return this;
  }

  in(column: string, values: FilterValue[]) {
    if (!values || values.length === 0) {
      this._filters.push('FALSE');
      return this;
    }
    const placeholders = values.map((_, i) => `$${this._values.length + i + 1}`).join(', ');
    this._values.push(...values);
    this._filters.push(`${column} IN (${placeholders})`);
    return this;
  }

  or(conditions: string) {
    const parts = conditions.split(',').map((c) => {
      const [col, op, ...valParts] = c.trim().split('.');
      const val = valParts.join('.');
      this._values.push(val);
      const idx = this._values.length;
      if (op === 'ilike') return `${col} ILIKE $${idx}`;
      if (op === 'eq') return `${col} = $${idx}`;
      return `${col} ILIKE $${idx}`;
    });
    this._filters.push(`(${parts.join(' OR ')})`);
    return this;
  }

  order(column: string, opts?: OrderOptions) {
    const dir = opts?.ascending === false ? 'DESC' : 'ASC';
    this._order = `${column} ${dir}`;
    return this;
  }

  limit(n: number) {
    this._limit = n;
    return this;
  }

  range(from: number, to: number) {
    this._range = [from, to];
    return this;
  }

  single() {
    this._single = true;
    this._limit = 1;
    return this;
  }

  async then(resolve: (result: any) => void, reject?: (err: any) => void) {
    try {
      resolve(await this.execute());
    } catch (err) {
      if (reject) reject(err);
      else resolve({ data: null, error: err });
    }
  }

  private buildWhere(): string {
    return this._filters.length > 0 ? `WHERE ${this._filters.join(' AND ')}` : '';
  }

  async execute(): Promise<{ data: T | T[] | null; error: any; count?: number }> {
    try {
      if (this._countOnly) {
        const text = `SELECT COUNT(*) as count FROM ${this.table} ${this.buildWhere()}`.trim().replace(/\s+/g, ' ');
        const rows = await runQuery<{ count: string }>(text, this._values);
        return { data: null, error: null, count: parseInt(rows[0]?.count ?? '0', 10) };
      }

      const order = this._order ? `ORDER BY ${this._order}` : '';
      let limitClause = '';
      if (this._range) {
        const count = this._range[1] - this._range[0] + 1;
        limitClause = `LIMIT ${count} OFFSET ${this._range[0]}`;
      } else if (this._limit) {
        limitClause = `LIMIT ${this._limit}`;
      }

      const text = `SELECT ${this._select} FROM ${this.table} ${this.buildWhere()} ${order} ${limitClause}`
        .trim()
        .replace(/\s+/g, ' ');

      const rows = await runQuery<T>(text, this._values);

      if (this._single) {
        return { data: (rows[0] as T) ?? null, error: null };
      }
      return { data: rows as T[], error: null };
    } catch (err: any) {
      console.error('[QueryBuilder] error on', this.table, ':', err.message);
      return { data: null, error: err };
    }
  }
}

// ─── InsertBuilder ────────────────────────────────────────────────────────────

class InsertBuilder<T = any> {
  private table: string;
  private data: any;

  constructor(table: string, data: any) {
    this.table = table;
    this.data = data;
  }

  select() { return this; }
  single() { return this; }

  async then(resolve: (result: any) => void, reject?: (err: any) => void) {
    try {
      resolve(await this.execute());
    } catch (err) {
      if (reject) reject(err);
      else resolve({ data: null, error: err });
    }
  }

  async execute(): Promise<{ data: T | T[] | null; error: any }> {
    try {
      const rows = Array.isArray(this.data) ? this.data : [this.data];
      let lastInserted: any = null;
      for (const row of rows) {
        const keys = Object.keys(row);
        const vals = Object.values(row);
        const placeholders = vals.map((_, i) => `$${i + 1}`).join(', ');
        const text = `INSERT INTO ${this.table} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`;
        const result = await runQuery<T>(text, vals);
        lastInserted = result[0];
      }
      return { data: lastInserted as T, error: null };
    } catch (err: any) {
      console.error('[InsertBuilder] error on', this.table, ':', err.message);
      return { data: null, error: err };
    }
  }
}

// ─── UpdateBuilder ────────────────────────────────────────────────────────────

class UpdateBuilder<T = any> {
  private table: string;
  private setClauses: string;
  private _filters: string[] = [];
  private _values: any[];

  constructor(table: string, data: any) {
    this.table = table;
    const keys = Object.keys(data);
    const vals = Object.values(data);
    this._values = [...vals];
    this.setClauses = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
  }

  eq(column: string, value: FilterValue) {
    this._values.push(value);
    this._filters.push(`${column} = $${this._values.length}`);
    return this;
  }

  select() { return this; }
  single() { return this; }

  async then(resolve: (result: any) => void, reject?: (err: any) => void) {
    try {
      resolve(await this.execute());
    } catch (err) {
      if (reject) reject(err);
      else resolve({ data: null, error: err });
    }
  }

  async execute(): Promise<{ data: T | null; error: any }> {
    try {
      const where = this._filters.length > 0 ? `WHERE ${this._filters.join(' AND ')}` : '';
      const text = `UPDATE ${this.table} SET ${this.setClauses} ${where} RETURNING *`.trim().replace(/\s+/g, ' ');
      const result = await runQuery<T>(text, this._values);
      return { data: (result[0] as T) ?? null, error: null };
    } catch (err: any) {
      console.error('[UpdateBuilder] error on', this.table, ':', err.message);
      return { data: null, error: err };
    }
  }
}

// ─── DeleteBuilder ────────────────────────────────────────────────────────────

class DeleteBuilder<T = any> {
  private table: string;
  private _filters: string[] = [];
  private _values: any[] = [];

  constructor(table: string) {
    this.table = table;
  }

  eq(column: string, value: FilterValue) {
    this._values.push(value);
    this._filters.push(`${column} = $${this._values.length}`);
    return this;
  }

  async then(resolve: (result: any) => void, reject?: (err: any) => void) {
    try {
      resolve(await this.execute());
    } catch (err) {
      if (reject) reject(err);
      else resolve({ data: null, error: err });
    }
  }

  async execute(): Promise<{ data: null; error: any }> {
    try {
      const where = this._filters.length > 0 ? `WHERE ${this._filters.join(' AND ')}` : '';
      const text = `DELETE FROM ${this.table} ${where}`.trim().replace(/\s+/g, ' ');
      await runQuery(text, this._values);
      return { data: null, error: null };
    } catch (err: any) {
      console.error('[DeleteBuilder] error on', this.table, ':', err.message);
      return { data: null, error: err };
    }
  }
}

// ─── Table name map ───────────────────────────────────────────────────────────

const TABLE_MAP: Record<string, string> = {
  users: 'jl_users',
  job_seekers: 'jl_job_seekers',
  employers: 'jl_employers',
  skills: 'jl_skills',
  job_seeker_skills: 'jl_job_seeker_skills',
  certificates: 'jl_certificates',
  experiences: 'jl_experiences',
  verification_documents: 'jl_verification_documents',
  job_categories: 'jl_job_categories',
  jobs: 'jl_jobs',
  job_skills: 'jl_job_skills',
  applications: 'jl_applications',
  job_matches: 'jl_job_matches',
  notifications: 'jl_notifications',
  activity_logs: 'jl_activity_logs',
  saved_jobs: 'jl_saved_jobs',
};

// ─── Supabase-compatible client shim ─────────────────────────────────────────

export const supabase = {
  from: <T = any>(table: string) => new QueryBuilder<T>(TABLE_MAP[table] ?? table),

  auth: {
    getSession: async () => {
      const session = await getStoredSession();
      if (!session) return { data: { session: null }, error: null };
      return { data: { session: { user: { id: session.userId } } }, error: null };
    },
    onAuthStateChange: (_cb: any) => ({
      data: { subscription: { unsubscribe: () => {} } },
    }),
    signUp: async () => ({ data: null, error: { message: 'Use authStore.signUp()' } }),
    signInWithPassword: async () => ({ data: null, error: { message: 'Use authStore.signIn()' } }),
    signOut: async () => ({ error: null }),
    resetPasswordForEmail: async () => ({ error: null }),
  },

  channel: (_name: string) => ({
    on: (_type: string, _opts: any, _cb: any) => ({ subscribe: () => null }),
    subscribe: () => null,
  }),
  removeChannel: (_channel: any) => {},
};

export default supabase;

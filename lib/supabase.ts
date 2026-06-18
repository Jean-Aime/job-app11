/**
 * Neon compatibility shim
 * Provides a supabase-like API surface backed by Neon PostgreSQL.
 * This lets existing screens work without rewriting every query.
 */
import { sql } from './db';
import { getStoredSession } from './auth';

type OrderOptions = { ascending?: boolean };
type FilterValue = string | number | boolean | null;

class QueryBuilder<T = any> {
  private table: string;
  private _select: string = '*';
  private _filters: string[] = [];
  private _values: any[] = [];
  private _order: string | null = null;
  private _limit: number | null = null;
  private _range: [number, number] | null = null;
  private _single = false;
  private _count: string | null = null;

  constructor(table: string) {
    this.table = table;
  }

  select(columns: string = '*', opts?: { count?: string; head?: boolean }) {
    this._select = this.parseSelect(columns);
    if (opts?.count) this._count = opts.count;
    return this;
  }

  private parseSelect(columns: string): string {
    // Handle nested selects like "*, employer:employers(name), skills:job_seeker_skills(*, skill:skills(*))"
    // For Neon we flatten these with JOINs - simplified version returns base columns
    if (columns === '*' || columns.trim() === '*') return '*';
    // Strip nested relation syntax for basic compatibility
    return columns.split(',').map(c => {
      const trimmed = c.trim();
      // Skip nested relations (they contain parentheses)
      if (trimmed.includes('(')) return null;
      // Handle aliases like "employer:employers" - just take the alias
      const alias = trimmed.split(':')[0].trim();
      return alias === '*' ? '*' : alias;
    }).filter(Boolean).join(', ') || '*';
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
    this._values.push(values);
    this._filters.push(`${column} = ANY($${this._values.length})`);
    return this;
  }

  or(conditions: string) {
    // Parse "title.ilike.%val%,description.ilike.%val%"
    const parts = conditions.split(',').map(c => {
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

  private buildQuery(): { text: string; values: any[] } {
    const where = this._filters.length > 0 ? `WHERE ${this._filters.join(' AND ')}` : '';
    const order = this._order ? `ORDER BY ${this._order}` : '';
    let limit = '';
    if (this._range) {
      const count = this._range[1] - this._range[0] + 1;
      limit = `LIMIT ${count} OFFSET ${this._range[0]}`;
    } else if (this._limit) {
      limit = `LIMIT ${this._limit}`;
    }
    const text = `SELECT ${this._select} FROM ${this.table} ${where} ${order} ${limit}`.trim().replace(/\s+/g, ' ');
    return { text, values: this._values };
  }

  async execute(): Promise<{ data: T | T[] | null; error: any; count?: number }> {
    try {
      const { text, values } = this.buildQuery();
      const rows = await sql(text as any, ...values);

      if (this._count === 'exact') {
        const countQuery = `SELECT COUNT(*) as count FROM ${this.table} ${this._filters.length > 0 ? `WHERE ${this._filters.join(' AND ')}` : ''}`;
        const countRows = await sql(countQuery as any, ...this._values);
        const count = parseInt((countRows[0] as any).count, 10);
        return { data: this._single ? (rows[0] ?? null) : rows as T[], error: null, count };
      }

      if (this._single) {
        return { data: (rows[0] as T) ?? null, error: null };
      }
      return { data: rows as T[], error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }
}

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
        const query = `INSERT INTO ${this.table} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`;
        const result = await sql(query as any, ...vals);
        lastInserted = result[0];
      }
      return { data: lastInserted as T, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }
}

class UpdateBuilder<T = any> {
  private table: string;
  private data: any;
  private _filters: string[] = [];
  private _values: any[] = [];

  constructor(table: string, data: any) {
    this.table = table;
    // Pre-fill values with the update data
    const keys = Object.keys(data);
    const vals = Object.values(data);
    this._values = [...vals];
    const setClauses = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    this.data = { setClauses };
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
      const query = `UPDATE ${this.table} SET ${this.data.setClauses} ${where} RETURNING *`;
      const result = await sql(query as any, ...this._values);
      return { data: (result[0] as T) ?? null, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }
}

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
      const query = `DELETE FROM ${this.table} ${where}`;
      await sql(query as any, ...this._values);
      return { data: null, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }
}

// ─── Supabase-compatible client shim ─────────────────────────────────────────

export const supabase = {
  from: <T = any>(table: string) => new QueryBuilder<T>(table),

  // Auth shim — no-op stubs (real auth is in lib/auth.ts)
  auth: {
    getSession: async () => {
      const session = await getStoredSession();
      if (!session) return { data: { session: null }, error: null };
      return { data: { session: { user: { id: session.userId } } }, error: null };
    },
    onAuthStateChange: (_cb: any) => {
      // No realtime auth state with Neon — return no-op
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
    signUp: async () => ({ data: null, error: { message: 'Use authStore.signUp()' } }),
    signInWithPassword: async () => ({ data: null, error: { message: 'Use authStore.signIn()' } }),
    signOut: async () => ({ error: null }),
    resetPasswordForEmail: async () => ({ error: null }),
  },

  // Realtime shim — polling replaces websocket subscriptions
  channel: (name: string) => ({
    on: (_type: string, _opts: any, _cb: any) => ({
      subscribe: () => null,
    }),
    subscribe: () => null,
  }),
  removeChannel: (_channel: any) => {},
};

export default supabase;

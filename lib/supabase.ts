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
  private _hasRelations = false;
  private _relations: Array<{ alias: string; spec: string }> = [];

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
    if (columns === '*' || columns.trim() === '*') return '*';
    
    // Split by comma, but need to handle nested parentheses correctly
    const parts: string[] = [];
    let current = '';
    let depth = 0;
    
    for (let i = 0; i < columns.length; i++) {
      const char = columns[i];
      if (char === '(') depth++;
      if (char === ')') depth--;
      
      if (char === ',' && depth === 0) {
        parts.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    if (current.trim()) parts.push(current.trim());
    
    // Process each part
    const baseColumns: string[] = [];
    
    for (const part of parts) {
      if (part === '*') {
        baseColumns.push('*');
        continue;
      }
      
      // Check if this is a nested relation like "job:jobs(...)"
      if (part.includes(':') && part.includes('(')) {
        const colonIndex = part.indexOf(':');
        const alias = part.substring(0, colonIndex).trim();
        this._hasRelations = true;
        this._relations.push({ alias, spec: part });
        // Don't add to baseColumns - handled by JOINs
      } else {
        // Regular column
        baseColumns.push(part);
      }
    }
    
    return baseColumns.length > 0 ? baseColumns.join(', ') : '*';
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
    
    // Handle common JOIN patterns
    let joins = '';
    let selectCols = this._select;
    
    if (this.table === 'jobs' && this._hasRelations) {
      const relationMap: Record<string, string> = {};
      
      for (const rel of this._relations) {
        if (rel.alias === 'employer' && rel.spec.includes('employers')) {
          joins += ' LEFT JOIN employers ON employers.id = jobs.employer_id';
          relationMap['employer'] = 'employers';
        }
        if (rel.alias === 'category' && rel.spec.includes('job_categories')) {
          joins += ' LEFT JOIN job_categories ON job_categories.id = jobs.category_id';
          relationMap['category'] = 'job_categories';
        }
        if (rel.alias === 'required_skills' && rel.spec.includes('job_skills')) {
          // Will need aggregation - skip for now, return basic job data
          relationMap['required_skills'] = 'skip';
        }
      }
      
      if (Object.keys(relationMap).length > 0) {
        const baseCols = `jobs.*`;
        const relCols = [];
        if (relationMap['employer']) {
          relCols.push(
            'employers.id as "employer.id"',
            'employers.company_name as "employer.company_name"',
            'employers.company_logo_url as "employer.company_logo_url"',
            'employers.industry as "employer.industry"',
            'employers.website as "employer.website"'
          );
        }
        if (relationMap['category']) {
          relCols.push('job_categories.name as "category.name"');
        }
        selectCols = [baseCols, ...relCols].join(', ');
      }
    }
    
    if (this.table === 'job_matches' && this._hasRelations) {
      for (const rel of this._relations) {
        if (rel.alias === 'job' && rel.spec.includes('jobs')) {
          joins += ' LEFT JOIN jobs ON jobs.id = job_matches.job_id';
          joins += ' LEFT JOIN employers ON employers.id = jobs.employer_id';
          joins += ' LEFT JOIN job_categories ON job_categories.id = jobs.category_id';
          
          selectCols = [
            'job_matches.match_score',
            'job_matches.skills_match',
            'job_matches.location_match',
            'job_matches.experience_match',
            'jobs.id as "job.id"',
            'jobs.title as "job.title"',
            'jobs.description as "job.description"',
            'jobs.employment_type as "job.employment_type"',
            'jobs.location as "job.location"',
            'jobs.city as "job.city"',
            'jobs.salary_min as "job.salary_min"',
            'jobs.salary_max as "job.salary_max"',
            'jobs.salary_currency as "job.salary_currency"',
            'jobs.is_remote as "job.is_remote"',
            'jobs.status as "job.status"',
            'jobs.created_at as "job.created_at"',
            'employers.company_name as "job.employer.company_name"',
            'employers.company_logo_url as "job.employer.company_logo_url"',
            'job_categories.name as "job.category.name"',
          ].join(', ');
        }
      }
    }
    
    if (this.table === 'saved_jobs' && this._hasRelations) {
      for (const rel of this._relations) {
        if (rel.alias === 'job' && rel.spec.includes('jobs')) {
          joins += ' LEFT JOIN jobs ON jobs.id = saved_jobs.job_id';
          joins += ' LEFT JOIN employers ON employers.id = jobs.employer_id';
          
          selectCols = [
            'saved_jobs.id',
            'saved_jobs.created_at',
            'jobs.id as "job.id"',
            'jobs.title as "job.title"',
            'jobs.city as "job.city"',
            'jobs.country as "job.country"',
            'jobs.is_remote as "job.is_remote"',
            'jobs.employment_type as "job.employment_type"',
            'jobs.salary_min as "job.salary_min"',
            'jobs.salary_max as "job.salary_max"',
            'jobs.salary_currency as "job.salary_currency"',
            'employers.company_name as "job.employer.company_name"',
            'employers.company_logo_url as "job.employer.company_logo_url"',
          ].join(', ');
        }
      }
    }
    
    if (this.table === 'applications' && this._hasRelations) {
      for (const rel of this._relations) {
        if (rel.alias === 'job' && rel.spec.includes('jobs')) {
          joins += ' LEFT JOIN jobs ON jobs.id = applications.job_id';
          joins += ' LEFT JOIN employers ON employers.id = jobs.employer_id';
          joins += ' LEFT JOIN job_categories ON job_categories.id = jobs.category_id';
          
          selectCols = [
            'applications.*',
            'jobs.id as "job.id"',
            'jobs.title as "job.title"',
            'jobs.city as "job.city"',
            'jobs.employment_type as "job.employment_type"',
            'jobs.salary_min as "job.salary_min"',
            'jobs.salary_max as "job.salary_max"',
            'jobs.salary_currency as "job.salary_currency"',
            'employers.company_name as "job.employer.company_name"',
            'employers.company_logo_url as "job.employer.company_logo_url"',
            'job_categories.name as "job.category.name"',
          ].join(', ');
        }
        if (rel.alias === 'job_seeker' && rel.spec.includes('job_seekers')) {
          joins += ' LEFT JOIN job_seekers ON job_seekers.id = applications.job_seeker_id';
          // Add job_seeker columns if not already added job columns
          if (!selectCols.includes('applications.*')) {
            selectCols = 'applications.*';
          }
          const jsColumns = [
            'job_seekers.id as "job_seeker.id"',
            'job_seekers.full_name as "job_seeker.full_name"',
            'job_seekers.profile_photo_url as "job_seeker.profile_photo_url"',
            'job_seekers.current_occupation as "job_seeker.current_occupation"',
            'job_seekers.years_of_experience as "job_seeker.years_of_experience"',
            'job_seekers.city as "job_seeker.city"',
          ];
          if (selectCols === 'applications.*') {
            selectCols = ['applications.*', ...jsColumns].join(', ');
          } else {
            selectCols = [selectCols, ...jsColumns].join(', ');
          }
        }
      }
    }
    
    if (this.table === 'job_seeker_skills' && this._hasRelations) {
      for (const rel of this._relations) {
        if (rel.alias === 'skill' && rel.spec.includes('skills')) {
          joins += ' LEFT JOIN skills ON skills.id = job_seeker_skills.skill_id';
          selectCols = [
            'job_seeker_skills.*',
            'skills.id as "skill.id"',
            'skills.name as "skill.name"',
            'skills.category as "skill.category"',
          ].join(', ');
        }
      }
    }
    
    const text = `SELECT ${selectCols} FROM ${this.table}${joins} ${where} ${order} ${limit}`.trim().replace(/\s+/g, ' ');
    return { text, values: this._values };
  }

  async execute(): Promise<{ data: T | T[] | null; error: any; count?: number }> {
    try {
      const { text, values } = this.buildQuery();
      
      // Import the raw neon client
      const { neon } = await import('@neondatabase/serverless');
      const sqlClient = neon(process.env.EXPO_PUBLIC_NEON_DATABASE_URL || '');
      
      // Execute the query
      let rows: any;
      
      if (values.length === 0) {
        rows = await sqlClient(text);
      } else {
        rows = await sqlClient(text, values);
      }

      // Ensure rows is always an array
      if (!rows) {
        rows = [];
      } else if (!Array.isArray(rows)) {
        rows = [rows];
      }

      // Transform flat rows with dotted keys into nested objects
      const transformedRows = rows.map((row: any) => {
        const obj: any = {};
        for (const [key, value] of Object.entries(row)) {
          if (key.includes('.')) {
            // Handle nested keys like "job.employer.company_name"
            const parts = key.split('.');
            let current = obj;
            for (let i = 0; i < parts.length - 1; i++) {
              if (!current[parts[i]]) current[parts[i]] = {};
              current = current[parts[i]];
            }
            current[parts[parts.length - 1]] = value;
          } else {
            obj[key] = value;
          }
        }
        return obj;
      });

      if (this._count === 'exact') {
        const countQuery = `SELECT COUNT(*) as count FROM ${this.table} ${this._filters.length > 0 ? `WHERE ${this._filters.join(' AND ')}` : ''}`;
        const countRows: any = await sqlClient(countQuery, this._values.length > 0 ? this._values : undefined);
        const countArray = Array.isArray(countRows) ? countRows : [countRows];
        const count = parseInt(countArray[0]?.count || '0', 10);
        return { data: this._single ? (transformedRows[0] ?? null) : transformedRows as T[], error: null, count };
      }

      if (this._single) {
        return { data: (transformedRows[0] as T) ?? null, error: null };
      }
      return { data: transformedRows as T[], error: null };
    } catch (err: any) {
      console.error('Query error:', err);
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

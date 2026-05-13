import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY ?? '';
const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

const missingConfigMessage =
  'Supabase environment variables are missing. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY to enable Supabase.';

type FallbackResult = { data: unknown[] | null; error: Error; count: number | null };
type FallbackBuilder = Promise<FallbackResult> & {
  select: (...args: unknown[]) => FallbackBuilder;
  order: (...args: unknown[]) => FallbackBuilder;
  insert: (...args: unknown[]) => FallbackBuilder;
  update: (...args: unknown[]) => FallbackBuilder;
  delete: (...args: unknown[]) => FallbackBuilder;
  upsert: (...args: unknown[]) => FallbackBuilder;
  eq: (...args: unknown[]) => FallbackBuilder;
  filter: (...args: unknown[]) => FallbackBuilder;
  limit: (...args: unknown[]) => FallbackBuilder;
  range: (...args: unknown[]) => FallbackBuilder;
  single: (...args: unknown[]) => FallbackBuilder;
  maybeSingle: (...args: unknown[]) => FallbackBuilder;
  rpc: (...args: unknown[]) => FallbackBuilder;
};

let hasWarned = false;
const warnOnMissingConfig = () => {
  if (hasSupabaseConfig || hasWarned) return;
  if (process.env.NODE_ENV !== 'test') {
    console.warn(missingConfigMessage);
  }
  hasWarned = true;
};

const createFallbackBuilder = (): FallbackBuilder => {
  warnOnMissingConfig();
  const result = Promise.resolve({
    data: null,
    error: new Error(missingConfigMessage),
    count: null
  }) as FallbackBuilder;

  const proxy = new Proxy(result, {
    get(target, prop) {
      if (prop in target) {
        const value = (target as unknown as Record<string, unknown>)[prop as string];
        if (typeof value === 'function') {
          return (value as (...args: unknown[]) => unknown).bind(target);
        }
        return value;
      }
      return () => proxy;
    }
  });

  return proxy;
};

const createFallbackService = () =>
  new Proxy(
    {},
    {
      get: () => () => createFallbackBuilder()
    }
  );

const createFallbackClient = (): SupabaseClient => {
  const base = {
    from: () => createFallbackBuilder(),
    rpc: () => createFallbackBuilder(),
    auth: createFallbackService(),
    storage: createFallbackService(),
    functions: createFallbackService()
  };
  const proxy = new Proxy(base, {
    get(target, prop) {
      if (prop in target) {
        const value = target[prop as keyof typeof target];
        return typeof value === 'function' ? value.bind(target) : value;
      }
      return () => createFallbackBuilder();
    }
  });
  return proxy as unknown as SupabaseClient;
};

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createFallbackClient();

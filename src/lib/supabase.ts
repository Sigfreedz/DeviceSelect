import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const missingConfigMessage =
  'Supabase environment variables are missing. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY to enable Supabase.';

type FallbackResult = { data: null; error: Error; count: null };
type FallbackBuilder = Promise<FallbackResult> & Record<string, unknown>;

const createFallbackBuilder = (): FallbackBuilder => {
  const result = Promise.resolve({
    data: null,
    error: new Error(missingConfigMessage),
    count: null
  }) as FallbackBuilder;

  const proxy = new Proxy(result, {
    get(target, prop) {
      if (prop in target) {
        const value = (target as Record<string, unknown>)[prop as string];
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

const createFallbackClient = (): SupabaseClient => {
  const base = { from: () => createFallbackBuilder() };
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

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(missingConfigMessage);
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createFallbackClient();

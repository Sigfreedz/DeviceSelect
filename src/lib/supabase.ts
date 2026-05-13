import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const missingConfigMessage =
  'Supabase environment variables are missing. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY to enable Supabase.';

type FallbackResult = { data: null; error: Error; count: null };

type FallbackBuilder = Promise<FallbackResult> & {
  select: (...args: unknown[]) => FallbackBuilder;
  order: (...args: unknown[]) => FallbackBuilder;
};

const createFallbackBuilder = (): FallbackBuilder => {
  const builder = Promise.resolve({
    data: null,
    error: new Error(missingConfigMessage),
    count: null
  }) as FallbackBuilder;
  builder.select = () => builder;
  builder.order = () => builder;
  return builder;
};

const createFallbackClient = (): SupabaseClient => ({
  from: () => createFallbackBuilder()
} as unknown as SupabaseClient);

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(missingConfigMessage);
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createFallbackClient();

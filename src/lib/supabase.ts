import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const missingConfigMessage =
  'Supabase environment variables are missing. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY to enable Supabase.';

const createFallbackBuilder = () => {
  const result = Promise.resolve({ data: null, error: new Error(missingConfigMessage), count: null });
  const builder: any = {
    then: result.then.bind(result),
    catch: result.catch.bind(result),
    finally: result.finally.bind(result),
    order: () => builder
  };
  return builder;
};

const createFallbackClient = (): SupabaseClient => {
  const builder = createFallbackBuilder();
  return {
    from: () => ({
      select: () => builder,
      order: () => builder
    })
  } as unknown as SupabaseClient;
};

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(missingConfigMessage);
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createFallbackClient();

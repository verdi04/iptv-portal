import { createClient } from '@supabase/supabase-js';

let supabaseClient;

export function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables are not configured.');
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseClient;
}

export const supabase = new Proxy(
  {},
  {
    get(_target, property) {
      const client = getSupabaseClient();
      const value = Reflect.get(client, property, client);

      return typeof value === 'function' ? value.bind(client) : value;
    },
  },
);

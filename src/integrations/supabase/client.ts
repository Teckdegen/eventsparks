import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Public client — used by all visitors
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

const ADMIN_EVENTS_URL = `${SUPABASE_URL}/functions/v1/admin-events`;

type AdminAction = "create" | "update" | "delete";

export const adminEventsCall = async (
  action: AdminAction,
  payload: { id?: string; event?: Record<string, unknown> }
) => {
  const res = await fetch(ADMIN_EVENTS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ action, ...payload }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Admin action failed");
  return data;
};

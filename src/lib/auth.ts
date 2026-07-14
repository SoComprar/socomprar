import { supabase, isSupabaseConfigured } from "./supabase";
import type { Session } from "@supabase/supabase-js";

function ensureSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase não está configurado. Verifique as variáveis de ambiente.");
  }
  return supabase;
}

export async function signIn(email: string, password: string): Promise<void> {
  const client = ensureSupabase();
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) {
    throw new Error(
      error.message === "Invalid login credentials" ? "E-mail ou senha inválidos." : error.message,
    );
  }
}

export async function signOut(): Promise<void> {
  const client = ensureSupabase();
  await client.auth.signOut();
}

export async function getSession(): Promise<Session | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function onAuthChange(callback: (session: Session | null) => void): () => void {
  if (!isSupabaseConfigured || !supabase) return () => {};
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
  return () => subscription.unsubscribe();
}

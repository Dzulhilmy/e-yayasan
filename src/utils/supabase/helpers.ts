import type { SupabaseClient } from '@supabase/supabase-js';

type RawProfile = Record<string, any>;

async function retry<T>(fn: () => Promise<T>, attempts = 2, delayMs = 300): Promise<T> {
  let lastError: any;
  for (let i = 0; i <= attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < attempts) await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw lastError;
}

function normalizeProfile(d: RawProfile, fallbackId: string) {
  return {
    id: d.user_id ?? d.id ?? fallbackId,
    full_name: d.full_name ?? d.name ?? d.fullName ?? "",
    ic_number: d.ic_number ?? d.nric ?? d.ic ?? "",
    email: d.email ?? "",
    phone: d.phone ?? "",
    address_line: d.address_line ?? d.address ?? undefined,
    postcode: d.postcode ?? d.postal_code ?? undefined,
    city: d.city ?? undefined,
    state: d.state ?? undefined,
    institution: d.institution ?? undefined,
    income: d.income ?? undefined,
    avatar_url: d.avatar_url ?? d.avatar ?? undefined,
  };
}

export async function fetchProfileWithFallback(supabase: SupabaseClient, userId: string) {
  return retry(async () => {
    // Try common linking column names
    let res = await supabase.from('profiles').select('*').eq('user_id', userId).single();
    if (res.error || !res.data) {
      res = await supabase.from('profiles').select('*').eq('id', userId).single();
    }
    if (!res || res.error) {
      // If still error, throw to be handled by caller
      throw res?.error ?? new Error('No profile');
    }
    return normalizeProfile(res.data, userId);
  }, 2, 350);
}

export async function fetchProgramsWithRetry(supabase: SupabaseClient) {
  return retry(async () => {
    const { data, error } = await supabase
      .from('programs')
      .select('id, title, required_documents')
      .eq('is_active', true)
      .order('title');
    if (error) throw error;
    return data ?? [];
  }, 2, 350);
}

export default { retry, fetchProfileWithFallback, fetchProgramsWithRetry };

import { supabase } from '@/integrations/supabase/client';

export interface Profile {
  id?: string;
  userId: string;
  fullName?: string;
  roleTitle?: string;
  phone?: string;
  avatarUrl?: string;
  companyName?: string;
  legalName?: string;
  cnpj?: string;
  cep?: string;
  address?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  website?: string;
  instagram?: string;
  logoUrl?: string;
  currency: string;
  dateFormat: string;
  theme: 'light' | 'dark' | 'system';
  defaultBudgetValidityDays: number;
}

function map(r: any): Profile {
  return {
    id: r.id,
    userId: r.user_id,
    fullName: r.full_name || undefined,
    roleTitle: r.role_title || undefined,
    phone: r.phone || undefined,
    avatarUrl: r.avatar_url || undefined,
    companyName: r.company_name || undefined,
    legalName: r.legal_name || undefined,
    cnpj: r.cnpj || undefined,
    cep: r.cep || undefined,
    address: r.address || undefined,
    number: r.number || undefined,
    complement: r.complement || undefined,
    neighborhood: r.neighborhood || undefined,
    city: r.city || undefined,
    state: r.state || undefined,
    website: r.website || undefined,
    instagram: r.instagram || undefined,
    logoUrl: r.logo_url || undefined,
    currency: r.currency || 'BRL',
    dateFormat: r.date_format || 'DD/MM/YYYY',
    theme: (r.theme as Profile['theme']) || 'light',
    defaultBudgetValidityDays: r.default_budget_validity_days || 30,
  };
}

export async function getMyProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle();
  if (data) return map(data);
  // auto-create
  const { data: created } = await supabase.from('profiles').insert({ user_id: user.id }).select().single();
  return created ? map(created) : null;
}

export async function updateMyProfile(p: Partial<Profile>): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const u: Record<string, any> = {};
  const mapKey: Record<string, string> = {
    fullName: 'full_name', roleTitle: 'role_title', phone: 'phone', avatarUrl: 'avatar_url',
    companyName: 'company_name', legalName: 'legal_name', cnpj: 'cnpj', cep: 'cep',
    address: 'address', number: 'number', complement: 'complement', neighborhood: 'neighborhood',
    city: 'city', state: 'state', website: 'website', instagram: 'instagram', logoUrl: 'logo_url',
    currency: 'currency', dateFormat: 'date_format', theme: 'theme',
    defaultBudgetValidityDays: 'default_budget_validity_days',
  };
  for (const [k, v] of Object.entries(p)) {
    const col = mapKey[k];
    if (col) u[col] = v === '' ? null : v;
  }
  await supabase.from('profiles').update(u).eq('user_id', user.id);
}

export async function uploadAvatar(file: File): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const ext = file.name.split('.').pop() || 'png';
  const path = `${user.id}/avatar-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadCompanyLogo(file: File): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const ext = file.name.split('.').pop() || 'png';
  const path = `${user.id}/logo-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('company-assets').upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from('company-assets').getPublicUrl(path);
  return data.publicUrl;
}

export async function lookupCEP(cep: string) {
  const cleaned = cep.replace(/\D/g, '');
  if (cleaned.length !== 8) return null;
  try {
    const r = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
    const d = await r.json();
    if (d.erro) return null;
    return {
      address: d.logradouro || '',
      neighborhood: d.bairro || '',
      city: d.localidade || '',
      state: d.uf || '',
    };
  } catch {
    return null;
  }
}

import { supabase } from '@/integrations/supabase/client';

export interface Client {
  id: string;
  name: string;
  document?: string;
  phone?: string;
  email?: string;
  cep?: string;
  address?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

function map(row: any): Client {
  return {
    id: row.id,
    name: row.name,
    document: row.document || undefined,
    phone: row.phone || undefined,
    email: row.email || undefined,
    cep: row.cep || undefined,
    address: row.address || undefined,
    number: row.number || undefined,
    complement: row.complement || undefined,
    neighborhood: row.neighborhood || undefined,
    city: row.city || undefined,
    state: row.state || undefined,
    notes: row.notes || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getAllClients(): Promise<Client[]> {
  const { data } = await supabase.from('clients').select('*').order('name');
  return (data || []).map(map);
}

export async function getClient(id: string): Promise<Client | undefined> {
  const { data } = await supabase.from('clients').select('*').eq('id', id).maybeSingle();
  return data ? map(data) : undefined;
}

export async function createClient(c: Partial<Client>): Promise<Client> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { data, error } = await supabase.from('clients').insert({
    user_id: user.id,
    name: c.name || '',
    document: c.document || null,
    phone: c.phone || null,
    email: c.email || null,
    cep: c.cep || null,
    address: c.address || null,
    number: c.number || null,
    complement: c.complement || null,
    neighborhood: c.neighborhood || null,
    city: c.city || null,
    state: c.state || null,
    notes: c.notes || null,
  }).select().single();
  if (error || !data) throw error;
  return map(data);
}

export async function updateClient(id: string, c: Partial<Client>): Promise<void> {
  const u: Record<string, any> = {};
  const keys: (keyof Client)[] = ['name', 'document', 'phone', 'email', 'cep', 'address', 'number', 'complement', 'neighborhood', 'city', 'state', 'notes'];
  for (const k of keys) {
    if (c[k] !== undefined) u[k as string] = (c[k] as any) || null;
  }
  if (c.name !== undefined) u.name = c.name;
  await supabase.from('clients').update(u).eq('id', id);
}

export async function deleteClient(id: string): Promise<void> {
  await supabase.from('clients').delete().eq('id', id);
}

export async function lookupCEP(cep: string): Promise<Partial<Client> | null> {
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

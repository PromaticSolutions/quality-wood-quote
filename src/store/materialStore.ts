import { supabase } from '@/integrations/supabase/client';

export interface Material {
  id: string;
  name: string;
  unit: string;
  costPrice: number;
  category: string;
  code?: string;
  description?: string;
  createdAt: string;
}

function map(r: any): Material {
  return {
    id: r.id,
    name: r.name,
    unit: r.unit,
    costPrice: Number(r.cost_price),
    category: r.category,
    code: r.code || undefined,
    description: r.description || undefined,
    createdAt: r.created_at,
  };
}

export async function getAllMaterials(): Promise<Material[]> {
  const { data } = await supabase.from('materials').select('*').order('name');
  return (data || []).map(map);
}

export async function createMaterial(m: Partial<Material>): Promise<Material> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { data, error } = await supabase.from('materials').insert({
    user_id: user.id,
    name: m.name || '',
    unit: m.unit || 'un',
    cost_price: m.costPrice ?? 0,
    category: m.category || 'outros',
    code: m.code || null,
    description: m.description || null,
  }).select().single();
  if (error || !data) throw error;
  return map(data);
}

export async function createMaterialsBulk(items: Partial<Material>[]): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const rows = items.map(m => ({
    user_id: user.id,
    name: m.name || '',
    unit: m.unit || 'un',
    cost_price: m.costPrice ?? 0,
    category: m.category || 'outros',
    code: m.code || null,
    description: m.description || null,
  }));
  await supabase.from('materials').insert(rows);
}

export async function updateMaterial(id: string, m: Partial<Material>): Promise<void> {
  const u: Record<string, any> = {};
  if (m.name !== undefined) u.name = m.name;
  if (m.unit !== undefined) u.unit = m.unit;
  if (m.costPrice !== undefined) u.cost_price = m.costPrice;
  if (m.category !== undefined) u.category = m.category;
  if (m.code !== undefined) u.code = m.code || null;
  if (m.description !== undefined) u.description = m.description || null;
  await supabase.from('materials').update(u).eq('id', id);
}

export async function deleteMaterial(id: string): Promise<void> {
  await supabase.from('materials').delete().eq('id', id);
}

export interface ParsedNFeItem {
  name: string;
  unit: string;
  costPrice: number;
  code?: string;
  description?: string;
}

export function parseNFeXML(xmlText: string): ParsedNFeItem[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'application/xml');
  if (doc.querySelector('parsererror')) throw new Error('XML inválido');
  const dets = doc.getElementsByTagName('det');
  const items: ParsedNFeItem[] = [];
  for (let i = 0; i < dets.length; i++) {
    const prod = dets[i].getElementsByTagName('prod')[0];
    if (!prod) continue;
    const get = (tag: string) => prod.getElementsByTagName(tag)[0]?.textContent?.trim() || '';
    const xProd = get('xProd');
    if (!xProd) continue;
    const uCom = get('uCom') || 'un';
    const vUnCom = parseFloat(get('vUnCom') || '0') || 0;
    const cProd = get('cProd');
    items.push({
      name: xProd,
      unit: uCom.toLowerCase(),
      costPrice: vUnCom,
      code: cProd || undefined,
    });
  }
  return items;
}

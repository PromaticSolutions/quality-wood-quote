import { supabase } from '@/integrations/supabase/client';

export type EventType = 'entrega' | 'instalacao' | 'medicao' | 'reuniao';

export interface AgendaEvent {
  id: string;
  title: string;
  type: EventType;
  clientId?: string;
  startsAt: string;
  endsAt?: string;
  notes?: string;
}

function map(r: any): AgendaEvent {
  return {
    id: r.id,
    title: r.title,
    type: r.type,
    clientId: r.client_id || undefined,
    startsAt: r.starts_at,
    endsAt: r.ends_at || undefined,
    notes: r.notes || undefined,
  };
}

export async function getAllEvents(): Promise<AgendaEvent[]> {
  const { data } = await supabase.from('events').select('*').order('starts_at');
  return (data || []).map(map);
}

export async function createEvent(e: Partial<AgendaEvent>): Promise<AgendaEvent> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { data, error } = await supabase.from('events').insert({
    user_id: user.id,
    title: e.title || '',
    type: e.type || 'reuniao',
    client_id: e.clientId || null,
    starts_at: e.startsAt!,
    ends_at: e.endsAt || null,
    notes: e.notes || null,
  }).select().single();
  if (error || !data) throw error;
  return map(data);
}

export async function updateEvent(id: string, e: Partial<AgendaEvent>): Promise<void> {
  const u: Record<string, any> = {};
  if (e.title !== undefined) u.title = e.title;
  if (e.type !== undefined) u.type = e.type;
  if (e.clientId !== undefined) u.client_id = e.clientId || null;
  if (e.startsAt !== undefined) u.starts_at = e.startsAt;
  if (e.endsAt !== undefined) u.ends_at = e.endsAt || null;
  if (e.notes !== undefined) u.notes = e.notes || null;
  await supabase.from('events').update(u).eq('id', id);
}

export async function deleteEvent(id: string): Promise<void> {
  await supabase.from('events').delete().eq('id', id);
}

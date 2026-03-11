import { supabase } from '@/integrations/supabase/client';
import { Budget, Room, BudgetItem } from '@/types/budget';

function mapBudgetRow(row: any, rooms: Room[]): Budget {
  return {
    id: row.id,
    clientName: row.client_name || '',
    architectName: row.architect_name || '',
    deliveryDays: row.delivery_days || 30,
    paymentTerms: row.payment_terms || '',
    clientAddress: row.client_address || undefined,
    clientNeighborhood: row.client_neighborhood || undefined,
    clientCity: row.client_city || undefined,
    clientState: row.client_state || undefined,
    generalObservations: row.general_observations || undefined,
    customTotal: row.custom_total ? Number(row.custom_total) : undefined,
    status: row.status || 'draft',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    rooms,
  };
}

function mapRoomRow(row: any, items: BudgetItem[]): Room {
  return {
    id: row.id,
    budgetId: row.budget_id,
    name: row.name,
    displayOrder: row.display_order || 0,
    items,
  };
}

function mapItemRow(row: any): BudgetItem {
  return {
    id: row.id,
    roomId: row.room_id,
    name: row.name,
    value: Number(row.value),
    measurements: row.measurements || undefined,
    observations: row.observations || undefined,
    displayOrder: row.display_order || 0,
  };
}

export async function getAllBudgets(): Promise<Budget[]> {
  const { data: budgetRows } = await supabase
    .from('budgets')
    .select('*')
    .order('updated_at', { ascending: false });

  if (!budgetRows || budgetRows.length === 0) return [];

  const budgetIds = budgetRows.map(b => b.id);
  const { data: roomRows } = await supabase
    .from('rooms')
    .select('*')
    .in('budget_id', budgetIds)
    .order('display_order');

  const roomIds = (roomRows || []).map(r => r.id);
  const { data: itemRows } = await supabase
    .from('items')
    .select('*')
    .in('room_id', roomIds.length > 0 ? roomIds : ['_none_'])
    .order('display_order');

  const itemsByRoom: Record<string, BudgetItem[]> = {};
  for (const item of itemRows || []) {
    if (!itemsByRoom[item.room_id]) itemsByRoom[item.room_id] = [];
    itemsByRoom[item.room_id].push(mapItemRow(item));
  }

  const roomsByBudget: Record<string, Room[]> = {};
  for (const room of roomRows || []) {
    if (!roomsByBudget[room.budget_id]) roomsByBudget[room.budget_id] = [];
    roomsByBudget[room.budget_id].push(mapRoomRow(room, itemsByRoom[room.id] || []));
  }

  return budgetRows.map(b => mapBudgetRow(b, roomsByBudget[b.id] || []));
}

export async function getBudget(id: string): Promise<Budget | undefined> {
  const { data: row } = await supabase.from('budgets').select('*').eq('id', id).single();
  if (!row) return undefined;

  const { data: roomRows } = await supabase
    .from('rooms')
    .select('*')
    .eq('budget_id', id)
    .order('display_order');

  const roomIds = (roomRows || []).map(r => r.id);
  const { data: itemRows } = await supabase
    .from('items')
    .select('*')
    .in('room_id', roomIds.length > 0 ? roomIds : ['_none_'])
    .order('display_order');

  const itemsByRoom: Record<string, BudgetItem[]> = {};
  for (const item of itemRows || []) {
    if (!itemsByRoom[item.room_id]) itemsByRoom[item.room_id] = [];
    itemsByRoom[item.room_id].push(mapItemRow(item));
  }

  const rooms = (roomRows || []).map(r => mapRoomRow(r, itemsByRoom[r.id] || []));
  return mapBudgetRow(row, rooms);
}

export async function createBudget(data: Partial<Budget>): Promise<Budget> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: row, error } = await supabase.from('budgets').insert({
    user_id: user.id,
    client_name: data.clientName || '',
    architect_name: data.architectName || '',
    delivery_days: data.deliveryDays || 30,
    payment_terms: data.paymentTerms || '',
  }).select().single();

  if (error || !row) throw error || new Error('Failed to create budget');
  return mapBudgetRow(row, []);
}

export async function updateBudgetInfo(id: string, data: Partial<Budget>): Promise<void> {
  const updates: Record<string, any> = {};
  if (data.clientName !== undefined) updates.client_name = data.clientName;
  if (data.architectName !== undefined) updates.architect_name = data.architectName;
  if (data.deliveryDays !== undefined) updates.delivery_days = data.deliveryDays;
  if (data.paymentTerms !== undefined) updates.payment_terms = data.paymentTerms;
  if (data.clientAddress !== undefined) updates.client_address = data.clientAddress || null;
  if (data.clientNeighborhood !== undefined) updates.client_neighborhood = data.clientNeighborhood || null;
  if (data.clientCity !== undefined) updates.client_city = data.clientCity || null;
  if (data.clientState !== undefined) updates.client_state = data.clientState || null;
  if (data.generalObservations !== undefined) updates.general_observations = data.generalObservations || null;
  if (data.customTotal !== undefined) updates.custom_total = data.customTotal;
  else if (data.customTotal === undefined && 'customTotal' in data) updates.custom_total = null;
  if (data.status !== undefined) updates.status = data.status;

  await supabase.from('budgets').update(updates).eq('id', id);
}

export async function deleteBudget(id: string): Promise<void> {
  await supabase.from('budgets').delete().eq('id', id);
}

// Room operations
export async function createRoom(budgetId: string, name: string, displayOrder: number): Promise<Room> {
  const { data: row, error } = await supabase.from('rooms').insert({
    budget_id: budgetId,
    name,
    display_order: displayOrder,
  }).select().single();
  if (error || !row) throw error || new Error('Failed to create room');
  return mapRoomRow(row, []);
}

export async function updateRoom(id: string, name: string): Promise<void> {
  await supabase.from('rooms').update({ name }).eq('id', id);
}

export async function deleteRoom(id: string): Promise<void> {
  await supabase.from('rooms').delete().eq('id', id);
}

// Item operations
export async function createItem(roomId: string, data: Partial<BudgetItem>): Promise<BudgetItem> {
  const { data: row, error } = await supabase.from('items').insert({
    room_id: roomId,
    name: data.name || '',
    value: data.value || 0,
    measurements: data.measurements || null,
    observations: data.observations || null,
    display_order: data.displayOrder || 0,
  }).select().single();
  if (error || !row) throw error || new Error('Failed to create item');
  return mapItemRow(row);
}

export async function updateItem(id: string, data: Partial<BudgetItem>): Promise<void> {
  const updates: Record<string, any> = {};
  if (data.name !== undefined) updates.name = data.name;
  if (data.value !== undefined) updates.value = data.value;
  if (data.measurements !== undefined) updates.measurements = data.measurements || null;
  if (data.observations !== undefined) updates.observations = data.observations || null;
  await supabase.from('items').update(updates).eq('id', id);
}

export async function deleteItem(id: string): Promise<void> {
  await supabase.from('items').delete().eq('id', id);
}

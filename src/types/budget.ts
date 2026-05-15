export interface BudgetItem {
  id: string;
  roomId: string;
  name: string;
  value: number;
  measurements?: string;
  observations?: string;
  displayOrder: number;
}

export interface Room {
  id: string;
  budgetId: string;
  name: string;
  items: BudgetItem[];
  displayOrder: number;
}

export interface Budget {
  id: string;
  clientId?: string;
  clientName: string;
  architectName: string;
  deliveryDays: number;
  paymentTerms: string;
  clientAddress?: string;
  clientNeighborhood?: string;
  clientCity?: string;
  clientState?: string;
  generalObservations?: string;
  rooms: Room[];
  customTotal?: number;
  status: 'draft' | 'finalized' | 'sent';
  createdAt: string;
  updatedAt: string;
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function calculateRoomSubtotal(room: Room): number {
  return room.items.reduce((sum, item) => sum + item.value, 0);
}

export function calculateBudgetTotal(budget: Budget): number {
  return budget.rooms.reduce((sum, room) => sum + calculateRoomSubtotal(room), 0);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

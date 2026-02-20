import { Budget, generateId } from '@/types/budget';

const STORAGE_KEY = 'marcenaria_quality_budgets';

function loadBudgets(): Budget[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveBudgets(budgets: Budget[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(budgets));
}

export function getAllBudgets(): Budget[] {
  return loadBudgets().sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function getBudget(id: string): Budget | undefined {
  return loadBudgets().find(b => b.id === id);
}

export function createBudget(data: Partial<Budget>): Budget {
  const budgets = loadBudgets();
  const now = new Date().toISOString();
  const budget: Budget = {
    id: generateId(),
    clientName: data.clientName || '',
    architectName: data.architectName || '',
    deliveryDays: data.deliveryDays || 30,
    paymentTerms: data.paymentTerms || '',
    rooms: [],
    status: 'draft',
    createdAt: now,
    updatedAt: now,
  };
  budgets.push(budget);
  saveBudgets(budgets);
  return budget;
}

export function updateBudget(id: string, data: Partial<Budget>): Budget | undefined {
  const budgets = loadBudgets();
  const idx = budgets.findIndex(b => b.id === id);
  if (idx === -1) return undefined;
  budgets[idx] = { ...budgets[idx], ...data, updatedAt: new Date().toISOString() };
  saveBudgets(budgets);
  return budgets[idx];
}

export function deleteBudget(id: string) {
  const budgets = loadBudgets().filter(b => b.id !== id);
  saveBudgets(budgets);
}

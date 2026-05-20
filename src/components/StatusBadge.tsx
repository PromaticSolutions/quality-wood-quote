import { cn } from '@/lib/utils';

type Status = 'approved' | 'pending' | 'cancelled' | 'draft' | 'active' | 'inactive' | string;

const map: Record<string, { label: string; classes: string }> = {
  approved: { label: 'Aprovado', classes: 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-[hsl(var(--success))]/30' },
  active: { label: 'Ativo', classes: 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-[hsl(var(--success))]/30' },
  pending: { label: 'Pendente', classes: 'bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/30' },
  in_progress: { label: 'Em andamento', classes: 'bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/30' },
  cancelled: { label: 'Cancelado', classes: 'bg-destructive/10 text-destructive border-destructive/30' },
  overdue: { label: 'Atrasado', classes: 'bg-destructive/10 text-destructive border-destructive/30' },
  draft: { label: 'Rascunho', classes: 'bg-muted text-muted-foreground border-border' },
  inactive: { label: 'Inativo', classes: 'bg-muted text-muted-foreground border-border' },
};

export function StatusBadge({ status, label, className }: { status: Status; label?: string; className?: string }) {
  const cfg = map[status] || map.draft;
  return (
    <span className={cn('inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-medium', cfg.classes, className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {label || cfg.label}
    </span>
  );
}

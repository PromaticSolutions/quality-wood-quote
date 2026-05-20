import { Bell } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import UserMenu from './UserMenu';

const routeTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/orcamentos': 'Orçamentos',
  '/clientes': 'Clientes',
  '/materiais': 'Materiais',
  '/agenda': 'Agenda',
  '/projetos': 'Projetos',
  '/configuracoes': 'Configurações',
};

export default function AppHeader({ leading }: { leading?: React.ReactNode }) {
  const { pathname } = useLocation();
  let title = routeTitles[pathname];
  if (!title) {
    if (pathname.startsWith('/budget/')) title = 'Editor de Orçamento';
    else if (pathname.startsWith('/em-breve/')) title = 'Em breve';
    else title = 'Marcenaria Quality';
  }

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-border bg-card shadow-sm">
      <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-3 min-w-0">
          {leading}
          <h1 className="truncate text-base font-semibold text-foreground">{title}</h1>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="relative h-9 w-9 text-muted-foreground" aria-label="Notificações">
            <Bell className="h-4 w-4" />
          </Button>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}

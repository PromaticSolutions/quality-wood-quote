import { FileText, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export default function AppHeader() {
  const { user, signOut } = useAuth();
  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <header className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
            <FileText className="h-5 w-5 text-accent-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Marcenaria Quality</h1>
            <p className="text-xs opacity-80">Sistema de Orçamentos</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden text-xs capitalize opacity-70 sm:block">{today}</span>
          {user && (
            <Button variant="ghost" size="sm" onClick={signOut} className="gap-1.5 text-primary-foreground hover:bg-primary-foreground/10">
              <LogOut className="h-4 w-4" /> Sair
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

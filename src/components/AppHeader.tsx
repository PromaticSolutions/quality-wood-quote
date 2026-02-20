import { FileText } from 'lucide-react';

export default function AppHeader() {
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
        <span className="hidden text-xs capitalize opacity-70 sm:block">{today}</span>
      </div>
    </header>
  );
}

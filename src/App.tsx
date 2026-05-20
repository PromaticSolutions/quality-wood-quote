import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppHeader from "./components/AppHeader";
import AppSidebar from "./components/AppSidebar";
import Dashboard from "./pages/Dashboard";
import Budgets from "./pages/Budgets";
import Projects from "./pages/Projects";
import BudgetEditor from "./pages/BudgetEditor";
import Clients from "./pages/Clients";
import Materials from "./pages/Materials";
import Agenda from "./pages/Agenda";
import ComingSoon from "./pages/ComingSoon";
import Settings, { applyTheme } from "./pages/Settings";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { getMyProfile } from "./store/profileStore";

const queryClient = new QueryClient();

function ProtectedShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user) {
      getMyProfile().then((p) => {
        if (p?.theme) applyTheme(p.theme);
      });
    }
  }, [user?.id]);

  if (loading) return <div className="flex min-h-screen items-center justify-center"><p className="text-muted-foreground">Carregando...</p></div>;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppHeader leading={<SidebarTrigger className="text-foreground hover:bg-muted" />} />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
            <Route path="/" element={<ProtectedShell><Dashboard /></ProtectedShell>} />
            <Route path="/orcamentos" element={<ProtectedShell><Budgets /></ProtectedShell>} />
            <Route path="/clientes" element={<ProtectedShell><Clients /></ProtectedShell>} />
            <Route path="/materiais" element={<ProtectedShell><Materials /></ProtectedShell>} />
            <Route path="/agenda" element={<ProtectedShell><Agenda /></ProtectedShell>} />
            <Route path="/projetos" element={<ProtectedShell><Projects /></ProtectedShell>} />
            <Route path="/configuracoes" element={<ProtectedShell><Settings /></ProtectedShell>} />
            <Route path="/budget/:id" element={<ProtectedShell><BudgetEditor /></ProtectedShell>} />
            <Route path="/em-breve/:modulo" element={<ProtectedShell><ComingSoon /></ProtectedShell>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

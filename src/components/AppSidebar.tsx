import { LayoutDashboard, FileText, FolderOpen, Users, Package, Calendar, Truck, Mail, MessageCircle } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const items = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard, exact: true },
  { title: 'Orçamentos', url: '/orcamentos', icon: FileText },
  { title: 'Clientes', url: '/clientes', icon: Users },
  { title: 'Materiais', url: '/materiais', icon: Package },
  { title: 'Agenda', url: '/agenda', icon: Calendar },
  { title: 'Projetos', url: '/projetos', icon: FolderOpen },
];

const soonItems = [
  { title: 'Fornecedores', url: '/em-breve/fornecedores', icon: Truck },
  { title: 'E-mail', url: '/em-breve/email', icon: Mail },
  { title: 'WhatsApp', url: '/em-breve/whatsapp', icon: MessageCircle },
];

export default function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { pathname } = useLocation();

  const isActive = (url: string, exact?: boolean) =>
    exact ? pathname === url : pathname === url || pathname.startsWith(url + '/');

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url, item.exact)}>
                    <NavLink to={item.url} end={item.exact} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Em breve</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {soonItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} className={cn('flex items-center gap-2 opacity-60')}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && (
                        <>
                          <span className="flex-1">{item.title}</span>
                          <Badge variant="secondary" className="h-4 px-1.5 text-[9px]">Em breve</Badge>
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

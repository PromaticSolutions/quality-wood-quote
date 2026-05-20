import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Settings, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getMyProfile, type Profile } from '@/store/profileStore';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function UserMenu() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (user) getMyProfile().then(setProfile);
  }, [user?.id]);

  const initials = (profile?.fullName || user?.email || '?').split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-md p-1 transition-colors hover:bg-muted">
        <Avatar className="h-8 w-8">
          <AvatarImage src={profile?.avatarUrl} />
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div className="hidden text-left sm:block">
          <p className="text-xs font-semibold leading-tight text-foreground">{profile?.fullName || user?.email?.split('@')[0]}</p>
          <p className="text-[10px] leading-tight text-muted-foreground">{profile?.companyName || 'Configurar empresa'}</p>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <p className="text-sm font-medium">{profile?.fullName || 'Minha conta'}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/configuracoes" className="cursor-pointer"><UserIcon className="mr-2 h-4 w-4" />Perfil</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/configuracoes" className="cursor-pointer"><Settings className="mr-2 h-4 w-4" />Configurações</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

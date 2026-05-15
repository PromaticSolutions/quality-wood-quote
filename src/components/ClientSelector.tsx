import { useEffect, useState } from 'react';
import { Check, ChevronsUpDown, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Client, getAllClients } from '@/store/clientStore';
import { cn } from '@/lib/utils';

interface Props {
  value?: string;
  onChange: (clientId: string | undefined, client: Client | undefined) => void;
  placeholder?: string;
}

export default function ClientSelector({ value, onChange, placeholder = 'Selecionar cliente...' }: Props) {
  const [open, setOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  useEffect(() => { getAllClients().then(setClients); }, []);

  const selected = clients.find(c => c.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
          <span className="flex items-center gap-2 truncate">
            <User className="h-4 w-4 shrink-0 text-muted-foreground" />
            {selected ? (
              <>
                <span className="truncate">{selected.name}</span>
                {selected.phone && <span className="text-xs text-muted-foreground">· {selected.phone}</span>}
              </>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-popover" align="start">
        <Command>
          <CommandInput placeholder="Buscar cliente..." />
          <CommandList>
            <CommandEmpty>Nenhum cliente encontrado. Cadastre em "Clientes".</CommandEmpty>
            <CommandGroup>
              {clients.map(c => (
                <CommandItem key={c.id} value={`${c.name} ${c.phone || ''}`} onSelect={() => { onChange(c.id, c); setOpen(false); }}>
                  <Check className={cn('mr-2 h-4 w-4', value === c.id ? 'opacity-100' : 'opacity-0')} />
                  <div className="flex flex-col">
                    <span>{c.name}</span>
                    {c.phone && <span className="text-xs text-muted-foreground">{c.phone}</span>}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

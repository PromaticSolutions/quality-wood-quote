import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

const labels: Record<string, string> = {
  fornecedores: 'Fornecedores',
  email: 'Conexão com E-mail',
  whatsapp: 'Conexão com WhatsApp',
};

export default function ComingSoon() {
  const { modulo } = useParams();
  const label = labels[modulo || ''] || 'Módulo';
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <Card>
        <CardContent className="flex flex-col items-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h2 className="mb-2 text-2xl font-bold">{label}</h2>
          <p className="text-sm text-muted-foreground">Este módulo está em desenvolvimento e estará disponível em breve.</p>
        </CardContent>
      </Card>
    </div>
  );
}

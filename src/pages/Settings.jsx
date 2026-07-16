import { useNavigate } from 'react-router-dom'
import { MessageSquareText, FileText } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'

export function Settings() {
  const navigate = useNavigate()

  return (
    <div>
      <div className="mb-6">
        <PageHeader
          title="Configurações"
          description="Gerencie as opções e configurações do sistema."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <button
          type="button"
          onClick={() => navigate('/message-templates')}
          className="flex items-center gap-4 rounded-xl bg-[var(--surface)] p-5 text-left shadow-sm transition-colors hover:bg-slate-50"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-light)] text-[var(--primary-dark)]">
            <MessageSquareText size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--text-heading)]">
              Templates de Mensagens
            </h3>
            <p className="text-sm text-slate-500">
              Cadastre e gerencie modelos de mensagens.
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate('/contract-settings')}
          className="flex items-center gap-4 rounded-xl bg-[var(--surface)] p-5 text-left shadow-sm transition-colors hover:bg-slate-50"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-light)] text-[var(--primary-dark)]">
            <FileText size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--text-heading)]">
              Contratos
            </h3>
            <p className="text-sm text-slate-500">
              Gerencie modelo, contratos assinados e envio aos alunos.
            </p>
          </div>
        </button>
      </div>
    </div>
  )
}

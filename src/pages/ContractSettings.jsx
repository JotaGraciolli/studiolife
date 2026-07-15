import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Upload, FileText } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { PageHeader } from '../components/PageHeader'
import { Loading } from '../components/Loading'
import { ErrorMessage } from '../components/ErrorMessage'
import { ConfirmDialog } from '../components/ConfirmDialog'

const BUCKET = 'contracts'
const ACCEPTED_TYPES = [
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

function formatFileSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(isoDate) {
  if (!isoDate) return ''
  return new Date(isoDate).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function ContractSettings() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [current, setCurrent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [showReplaceConfirm, setShowReplaceConfirm] = useState(false)

  useEffect(() => {
    loadCurrent()
  }, [])

  async function loadCurrent() {
    setLoading(true)
    setError('')
    try {
      const { data, error: supaError } = await supabase
        .from('contract_settings')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (supaError) throw supaError
      setCurrent(data)
    } catch (err) {
      const detail = err?.message || err?.error_description || JSON.stringify(err)
      setError(`Erro ao carregar modelo atual: ${detail}`)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) {
      setSelectedFile(null)
      return
    }

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Por favor, selecione um arquivo do tipo .doc ou .docx.')
      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setError('')
    setSelectedFile(file)
  }

  async function performUpload() {
    if (!selectedFile) return

    setUploading(true)
    setError('')

    try {
      if (current?.file_path) {
        const { error: removeError } = await supabase.storage
          .from(BUCKET)
          .remove([current.file_path])
        if (removeError) console.error('Erro ao remover arquivo anterior:', removeError)
      }

      const extension = selectedFile.name.split('.').pop()
      const filePath = `contract_template.${extension}`

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, selectedFile, {
          upsert: true,
          contentType: selectedFile.type,
        })

      if (uploadError) throw uploadError

      const payload = {
        file_name: selectedFile.name,
        file_path: filePath,
        file_size: selectedFile.size,
        content_type: selectedFile.type,
        updated_at: new Date().toISOString(),
      }

      if (current) {
        const { error: updateError } = await supabase
          .from('contract_settings')
          .update(payload)
          .eq('id', current.id)
        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase
          .from('contract_settings')
          .insert(payload)
        if (insertError) throw insertError
      }

      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      await loadCurrent()
    } catch (err) {
      const detail = err?.message || err?.error_description || JSON.stringify(err)
      setError(`Erro ao enviar arquivo: ${detail}`)
      console.error(err)
    } finally {
      setUploading(false)
      setShowReplaceConfirm(false)
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!selectedFile) return

    if (current) {
      setShowReplaceConfirm(true)
    } else {
      performUpload()
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/settings')}
          className="rounded-lg border border-[var(--border)] bg-white p-2 text-[var(--text)] hover:bg-slate-50"
          aria-label="Voltar para configurações"
        >
          <ArrowLeft size={18} />
        </button>
        <PageHeader
          title="Upload de Modelo de Contrato"
          description="Envie o modelo de contrato que será usado pelo sistema."
        />
      </div>

      <ErrorMessage message={error} />

      {loading ? (
        <Loading />
      ) : (
        <div className="rounded-xl bg-[var(--surface)] p-6 shadow-sm">
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <p className="font-medium">Atenção</p>
            <p className="mt-1">
              Apenas um modelo de contrato pode ser armazenado. Um novo upload
              substituirá o arquivo atual permanentemente.
            </p>
          </div>

          {current && (
            <div className="mb-6 rounded-lg border border-[var(--border)] bg-white p-4">
              <p className="mb-3 text-sm font-medium text-[var(--text-heading)]">
                Modelo atual
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-light)] text-[var(--primary-dark)]">
                  <FileText size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-[var(--text-heading)]">
                    {current.file_name}
                  </p>
                  <p className="text-sm text-slate-500">
                    {formatFileSize(current.file_size)} • Atualizado em{' '}
                    {formatDate(current.updated_at)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--text-heading)]">
                Arquivo <span className="text-[var(--danger)]">*</span>
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".doc,.docx"
                onChange={handleFileChange}
                className="block w-full text-sm text-[var(--text)] file:mr-4 file:rounded-lg file:border-0 file:bg-[var(--primary)] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-[var(--primary-dark)]"
              />
              <p className="mt-1 text-xs text-slate-400">
                Formatos aceitos: .doc e .docx
              </p>
            </div>

            {selectedFile && (
              <p className="text-sm text-slate-600">
                Arquivo selecionado:{" "}
                <span className="font-medium">{selectedFile.name}</span>{" "}
                <span className="text-slate-400">
                  ({formatFileSize(selectedFile.size)})
                </span>
              </p>
            )}

            <button
              type="submit"
              disabled={!selectedFile || uploading}
              className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-dark)] disabled:opacity-70"
            >
              <Upload size={18} />
              {uploading
                ? 'Enviando...'
                : current
                ? 'Substituir modelo'
                : 'Enviar modelo'}
            </button>
          </form>
        </div>
      )}

      <ConfirmDialog
        open={showReplaceConfirm}
        title="Substituir modelo de contrato"
        message="Já existe um modelo de contrato salvo. Deseja substituí-lo pelo novo arquivo? Essa ação não pode ser desfeita."
        onConfirm={performUpload}
        onCancel={() => setShowReplaceConfirm(false)}
      />
    </div>
  )
}

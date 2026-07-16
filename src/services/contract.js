import PizZip from 'pizzip'
import Docxtemplater from 'docxtemplater'
import { renderAsync } from 'docx-preview'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { saveAs } from 'file-saver'
import { supabase } from './supabase'

const BUCKET = 'contracts'
const CONTRACT_FILE_PATH = 'contract_template.docx'

const weekDayLabels = {
  segunda: 'Segunda-feira',
  terca: 'Terça-feira',
  quarta: 'Quarta-feira',
  quinta: 'Quinta-feira',
  sexta: 'Sexta-feira',
  sabado: 'Sábado',
  domingo: 'Domingo',
}

function formatCEP(value) {
  if (!value) return ''
  const digits = String(value).replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 5) return digits
  return `${digits.slice(0, 5)}-${digits.slice(5)}`
}

export function formatAddress(address) {
  if (!address) return ''
  const parts = [
    address.street,
    address.number,
    address.complement,
    address.neighborhood,
    address.city && address.state
      ? `${address.city} - ${address.state}`
      : address.city || address.state,
  ].filter(Boolean)
  const cep = address.cep ? `CEP: ${formatCEP(address.cep)}` : null
  if (parts.length === 0 && !cep) return ''
  return [...parts, cep].filter(Boolean).join(', ')
}

function formatCurrency(value) {
  if (value == null || value === '') return ''
  const number = Number(value)
  if (Number.isNaN(number)) return ''
  return number.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function formatFrequency(trainingDays) {
  const count = trainingDays?.filter((t) => !t.provisional).length || 0
  if (count <= 0) return ''
  if (count === 1) return '1 vez por semana'
  return `${count} vezes por semana`
}

function formatDaysAndTimes(trainingDays) {
  if (!trainingDays || trainingDays.length === 0) return ''
  const order = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo']
  return trainingDays
    .slice()
    .sort((a, b) => order.indexOf(a.week_day) - order.indexOf(b.week_day))
    .map((t) => {
      const label = weekDayLabels[t.week_day] || t.week_day
      const time = t.training_time ? t.training_time.slice(0, 5) : '--:--'
      return `${label} às ${time}`
    })
    .join(', ')
}

function getFirstName(fullName) {
  if (!fullName) return ''
  return fullName.trim().split(' ')[0]
}

function validateContractData(client, address, trainingDays) {
  const missing = []

  if (!client.name?.trim()) missing.push('Nome do aluno')
  if (!client.cpf?.trim()) missing.push('CPF')

  if (!address) {
    missing.push('Endereço')
  } else {
    if (!address.street?.trim()) missing.push('Rua')
    if (!address.number?.trim()) missing.push('Número')
    if (!address.neighborhood?.trim()) missing.push('Bairro')
    if (!address.city?.trim()) missing.push('Cidade')
    if (!address.state?.trim()) missing.push('Estado')
    if (!address.cep?.trim()) missing.push('CEP')
  }

  const regularDays = trainingDays?.filter((t) => !t.provisional) || []
  if (regularDays.length === 0) missing.push('Dias/horários de treino (não provisionais)')

  if (!trainingDays || trainingDays.length === 0) {
    missing.push('Dias/horários de treino')
  }

  if (client.monthly_fee == null || client.monthly_fee === '') missing.push('Mensalidade')

  if (missing.length > 0) {
    throw new Error(
      `Para gerar o contrato, preencha os seguintes campos: ${missing.join(', ')}.`,
    )
  }
}

export async function fetchContractTemplate() {
  const { data: settings, error: settingsError } = await supabase
    .from('contract_settings')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (settingsError) throw settingsError
  if (!settings) throw new Error('Nenhum modelo de contrato cadastrado.')

  const filePath = settings.file_path || CONTRACT_FILE_PATH

  const { data: fileData, error: downloadError } = await supabase.storage
    .from(BUCKET)
    .download(filePath)

  if (downloadError) throw downloadError

  return {
    fileData,
    fileName: settings.file_name || 'contrato.docx',
  }
}

function generateDocxFilled(templateBuffer, client, address, trainingDays) {
  const zip = new PizZip(templateBuffer)

  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: {
      start: '{{',
      end: '}}',
    },
  })

  doc.render({
    ALUNO: client.name || '',
    CPF: client.cpf || '',
    ENDERECO: formatAddress(address),
    FREQUENCIA: formatFrequency(trainingDays),
    DIAS_HORARIOS: formatDaysAndTimes(trainingDays),
    MENSALIDADE: formatCurrency(client.monthly_fee),
  })

  return doc.getZip().generate({ type: 'arraybuffer' })
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function renderDocxToPdf(docxBuffer) {
  const wrapper = document.createElement('div')
  wrapper.style.position = 'absolute'
  wrapper.style.top = '0'
  wrapper.style.left = '-9999px'
  wrapper.style.width = '210mm'
  wrapper.style.zIndex = '-1'
  document.body.appendChild(wrapper)

  const container = document.createElement('div')
  container.style.width = '210mm'
  container.style.background = 'white'
  wrapper.appendChild(container)

  try {
    await renderAsync(docxBuffer, container, null, {
      className: 'docx-preview-page',
      inWrapper: false,
      ignoreWidth: false,
      ignoreHeight: false,
      ignoreFonts: false,
      breakPages: true,
      ignoreLastRenderedPageBreak: true,
      trimXmlDeclaration: true,
      useBase64URL: false,
      renderChanges: false,
      renderComments: false,
      renderHeaders: true,
      renderFooters: true,
      renderFootnotes: true,
    })

    await wait(800)

    const pages = container.querySelectorAll('.docx-preview-page')
    if (pages.length === 0 && container.innerHTML.trim() === '') {
      throw new Error('Não foi possível renderizar o conteúdo do contrato.')
    }

    const targets = (pages.length > 0 ? Array.from(pages) : [container]).filter(
      (target) => target.innerHTML.trim().length > 0,
    )

    if (targets.length === 0) {
      throw new Error('Não foi possível renderizar o conteúdo do contrato.')
    }

    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
    const pageWidth = 210
    const pageHeight = 297

    for (let i = 0; i < targets.length; i++) {
      const target = targets[i]
      const canvas = await html2canvas(target, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: target.scrollWidth,
        height: target.scrollHeight,
      })

      const imgData = canvas.toDataURL('image/jpeg', 0.98)
      const imgWidth = pageWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      if (i > 0) {
        pdf.addPage()
      }

      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, Math.min(imgHeight, pageHeight))
    }

    return pdf.output('blob')
  } finally {
    document.body.removeChild(wrapper)
  }
}

export async function generateContract(templateBuffer, client, address, trainingDays) {
  validateContractData(client, address, trainingDays)
  const filledDocx = generateDocxFilled(templateBuffer, client, address, trainingDays)
  return renderDocxToPdf(filledDocx)
}

export function downloadContract(blob, originalFileName, clientName) {
  const firstName = getFirstName(clientName)
  const baseName = originalFileName.replace(/\.[^.]+$/, '')
  const fileName = firstName ? `${baseName}_${firstName}.pdf` : `${baseName}.pdf`

  saveAs(blob, fileName)
}

export async function generateAndDownloadContract(client, address, trainingDays) {
  const { fileData, fileName } = await fetchContractTemplate()

  if (!fileName.toLowerCase().endsWith('.docx')) {
    throw new Error(
      'O modelo de contrato precisa estar no formato .docx para gerar o contrato automaticamente. Faça o upload de um arquivo .docx.',
    )
  }

  const arrayBuffer = await fileData.arrayBuffer()
  const blob = await generateContract(arrayBuffer, client, address, trainingDays)
  downloadContract(blob, fileName, client.name)
}

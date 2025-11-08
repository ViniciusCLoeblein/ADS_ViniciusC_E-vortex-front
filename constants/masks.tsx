import { NativeSyntheticEvent, TextInputKeyPressEventData } from 'react-native'

export const maskCPF = (v: string | number): string => {
  const value = String(v).replace(/\D/g, '').slice(0, 11)

  return value
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export const maskDate = (v: string | number): string => {
  const value = String(v).replace(/\D/g, '').slice(0, 9)
  return value.replace(/(\d{2})(\d)/, '$1/$2').replace(/(\d{2})(\d)/, '$1/$2')
}

export const maskPhone = (v: string | number): string => {
  const value = String(v).replace(/\D/g, '').slice(0, 16)

  return value
    .replace(/(\d)/, '($1')
    .replace(/(\d{2})(\d)/, '$1) $2')
    .replace(/(\d{2})(\d{1,4})$/, '$1-$2')
}

export const rejectLetter = (
  e: NativeSyntheticEvent<TextInputKeyPressEventData>,
) => {
  const key = e.nativeEvent.key
  if (
    !/[0-9]/.test(key) &&
    key !== 'Backspace' &&
    key !== 'Delete' &&
    key !== 'Tab' &&
    key !== 'ArrowUp' &&
    key !== 'ArrowDown' &&
    key !== 'ArrowLeft' &&
    key !== 'ArrowRight'
  ) {
    e.preventDefault()
  }
}

export function removeCaracter(v: string | undefined | null) {
  if (!v) return ''

  return v.replace(/\D/g, '')
}

export const maskMoney = (v?: string | number | null): string => {
  const valorNumerico = typeof v === 'string' ? parseFloat(v) : (v ?? 0)
  if (!isNaN(valorNumerico)) {
    const valorFormatado = valorNumerico.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })

    return valorFormatado
  } else {
    return 'R$ 0,00'
  }
}

export function unMaskMoney(value: string): number {
  return parseFloat(
    value.replace('R$', '').replaceAll('.', '').replace(',', '.'),
  )
}

export function maskCardNumber(cardNumber: string | undefined | null): string {
  if (!cardNumber) return '**** **** ****'

  if (cardNumber.includes('.')) {
    cardNumber = cardNumber.split('.').pop() ?? ''
  }

  const numeros = cardNumber.replace(/\D/g, '')

  let formatado = ''
  for (let i = 0; i < 12; i += 4) {
    const grupo = numeros.substring(i, i + 4)
    if (grupo) {
      formatado += grupo + ' '
    } else {
      formatado += '**** '
    }
  }

  return formatado.trim()
}

export const maskCEP = (v: string | number): string => {
  const value = String(v).replace(/\D/g, '').slice(0, 8)
  return value
}

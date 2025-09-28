import dayjs from './dayjs-config'

export function formatDateToBr(isoDate: string): string {
  if (isoDate?.endsWith('z')) {
    return dayjs(isoDate).tz('America/Noronha').format('DD/MM/YYYY')
  } else {
    return dayjs.utc(isoDate).format('DD/MM/YYYY')
  }
}

export function formatDateToBrHr(isoDate: string): string {
  if (isoDate?.endsWith('z')) {
    return dayjs(isoDate)
      .tz('America/Noronha')
      .format('DD/MM/YYYY [às] HH:mm:ss')
  } else {
    return dayjs.utc(isoDate).format('DD/MM/YYYY [às] HH:mm:ss')
  }
}

export function removeCaracter(v: string | undefined | null) {
  if (!v) return ''

  return v.replace(/\D/g, '')
}

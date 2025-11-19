import { z } from 'zod'

export const validatorPassword = z
  .string()
  .length(6, 'A senha deve ter exatamente 6 dígitos.')
  .regex(/^\d{6}$/, 'A senha deve conter apenas números.')
  .refine(
    (password) =>
      !/^(?:123456|234567|345678|456789|567890|987654|876543|765432|654321|543210)$/.test(
        password,
      ),
    {
      message: 'A senha não pode ser uma sequência numérica.',
    },
  )
  .refine((password) => !/^(\d)\1{5}$/.test(password), {
    message: 'A senha não pode conter números repetidos.',
  })

  .refine((password) => !/^(\d{2})\1{2}$/.test(password), {
    message: 'A senha não pode conter padrões repetitivos',
  })

export const validatorPaymentDay = z
  .string()
  .min(1, 'Dia inválido')
  .max(2, 'Dia inválido')
  .refine(
    (val) => {
      const month = parseInt(val)
      return month >= 1 && month <= 31
    },
    {
      message: `Dia deve ser entre 1 e 31`,
    },
  )

export const validatorAdmissionYear = z
  .string()
  .min(4, 'Ano inválido')
  .max(4, 'Ano inválido')
  .refine(
    (val) => {
      const year = parseInt(val)
      const currentYear = new Date().getFullYear()
      return year >= currentYear - 70 && year <= currentYear
    },
    {
      message: `Ano deve ser entre ${new Date().getFullYear() - 70} e ${new Date().getFullYear()}`,
    },
  )

export const validatorAdmissionMonth = z
  .string()
  .min(1, 'Mês inválido')
  .max(2, 'Mês inválido')
  .refine(
    (val) => {
      const month = parseInt(val)
      return month >= 1 && month <= 12
    },
    {
      message: `Mês deve ser entre 1 e 12`,
    },
  )

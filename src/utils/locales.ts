import { Locale } from 'payload'

export const locales = [
  { label: 'Hrvatski', code: 'hr' },
  { label: 'English', code: 'en' },
  { label: 'French', code: 'fr' },
  { label: 'German', code: 'de' },
  { label: 'Italian', code: 'it' },
  { label: 'Slovenian', code: 'si' },
] as const satisfies Locale[]

type LocaleCode = (typeof locales)[number]['code']

export const defaultLocale = 'hr' as LocaleCode

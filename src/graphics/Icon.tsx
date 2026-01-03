// This is a React Server Component (RSC), NOT a server action
// RSCs don't need 'use server' - that's only for functions callable from client

import { getTenantLogo } from '@/utils/get-tenant-from-request'
import Image from 'next/image'

export const Icon = async () => {
  const logoUrl = await getTenantLogo()
  console.log({ logoUrl })

  return <Image src={logoUrl || '/vrhotelo-logo.png'} alt="Logo" width={100} height={100} />
}

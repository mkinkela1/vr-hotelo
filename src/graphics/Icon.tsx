'use server'

import { getTenantLogo } from '@/utils/get-tenant-from-request'
import Image from 'next/image'

export const Icon = async () => {
  const logoUrl = await getTenantLogo()

  return <Image src={logoUrl || '/vrhotelo-logo.png'} alt="Logo" width={100} height={100} />
}

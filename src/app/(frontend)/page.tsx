import config from '@/payload.config'
import { redirect } from 'next/navigation'
import './styles.css'

export default async function HomePage() {
  const payloadConfig = await config

  const adminUrl = payloadConfig.routes.admin

  redirect(adminUrl)
}

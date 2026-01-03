/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import config from '@payload-config'
import '@payloadcms/next/css'
import {
  REST_DELETE,
  REST_GET,
  REST_OPTIONS,
  REST_PATCH,
  REST_POST,
  REST_PUT,
} from '@payloadcms/next/routes'
import { NextRequest } from 'next/server'

// Configure route to handle large file uploads
export const maxDuration = 3600 // INCREASED: 60 minutes for 3GB+ files

// #region agent log
let requestCount = 0
let errorCount = 0

const wrapHandler = (handler: (req: NextRequest) => Promise<Response>, method: string) => {
  return async (req: NextRequest) => {
    const reqId = ++requestCount
    const startTime = Date.now()
    const path = req.nextUrl.pathname

    try {
      const response = await handler(req)
      const duration = Date.now() - startTime

      if (response.status >= 500) {
        errorCount++
        console.log(
          '[DEBUG:5XX]',
          JSON.stringify({
            method,
            path,
            status: response.status,
            duration,
            totalRequests: requestCount,
            totalErrors: errorCount,
            timestamp: new Date().toISOString(),
          }),
        )
      }

      return response
    } catch (err: any) {
      errorCount++
      const duration = Date.now() - startTime

      console.log(
        '[DEBUG:EXCEPTION]',
        JSON.stringify({
          method,
          path,
          error: err?.message,
          stack: err?.stack?.substring(0, 500),
          duration,
          totalRequests: requestCount,
          totalErrors: errorCount,
          timestamp: new Date().toISOString(),
        }),
      )

      throw err
    }
  }
}
// #endregion

export const GET = wrapHandler(REST_GET(config), 'GET')
export const POST = wrapHandler(REST_POST(config), 'POST')
export const DELETE = wrapHandler(REST_DELETE(config), 'DELETE')
export const PATCH = wrapHandler(REST_PATCH(config), 'PATCH')
export const PUT = wrapHandler(REST_PUT(config), 'PUT')
export const OPTIONS = REST_OPTIONS(config)

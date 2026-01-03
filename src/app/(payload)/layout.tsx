/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import config from '@payload-config'
import '@payloadcms/next/css'
import type { ServerFunctionClient } from 'payload'
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts'
import React from 'react'

import { importMap } from './admin/importMap.js'
import './custom.scss'

type Args = {
  children: React.ReactNode
}

// #region agent log
let serverFunctionCallCount = 0
// #endregion

const serverFunction: ServerFunctionClient = async function (args) {
  'use server'
  // #region agent log
  serverFunctionCallCount++
  const callId = serverFunctionCallCount
  const startTime = Date.now()
  console.log(
    '[DEBUG:SERVER_ACTION]',
    JSON.stringify({
      event: 'start',
      callId,
      totalCalls: serverFunctionCallCount,
      argsName: args?.name,
      timestamp: new Date().toISOString(),
    }),
  )
  // #endregion

  try {
    const result = await handleServerFunctions({
      ...args,
      config,
      importMap,
    })

    // #region agent log
    console.log(
      '[DEBUG:SERVER_ACTION]',
      JSON.stringify({
        event: 'success',
        callId,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      }),
    )
    // #endregion

    return result
  } catch (error: any) {
    // #region agent log
    console.log(
      '[DEBUG:SERVER_ACTION]',
      JSON.stringify({
        event: 'error',
        callId,
        duration: Date.now() - startTime,
        errorMessage: error?.message,
        errorName: error?.name,
        timestamp: new Date().toISOString(),
      }),
    )
    // #endregion
    throw error
  }
}

const Layout = ({ children }: Args) => (
  <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
    {children}
  </RootLayout>
)

export default Layout

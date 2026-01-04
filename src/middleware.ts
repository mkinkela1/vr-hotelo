import { NextRequest, NextResponse } from 'next/server'

/**
 * Extract clean hostname from host header
 */
function getUrlFromHost(host: string): string {
  const cleanHost = host.replace('https://', '').replace('http://', '').replace('www.', '')
  return cleanHost.split(':')[0]
}

/**
 * Check if request is a server action
 * In Next.js 15, server actions can have various header patterns
 */
function isServerActionRequest(request: NextRequest): boolean {
  const method = request.method

  // Check for Next-Action header (case-insensitive)
  const nextAction =
    request.headers.get('next-action') ||
    request.headers.get('Next-Action') ||
    request.headers.get('NEXT-ACTION')

  const contentType = request.headers.get('content-type') || ''
  const pathname = request.nextUrl.pathname

  // Server actions typically:
  // 1. Have Next-Action header (various cases)
  // 2. Are POST requests
  // 3. May be sent to _next/actions endpoint
  // 4. May have RSC-related headers
  const hasActionHeader = !!nextAction
  const isPostRequest = method === 'POST'
  const isActionsPath = pathname.includes('_next/actions') || pathname.includes('_next/action')
  const hasRscHeader = !!request.headers.get('rsc') || !!request.headers.get('RSC')

  return hasActionHeader || (isPostRequest && (isActionsPath || hasRscHeader))
}

/**
 * Log server action details for debugging
 */
function logServerAction(request: NextRequest) {
  // Get all headers
  const allHeaders: Record<string, string> = {}
  request.headers.forEach((value, key) => {
    allHeaders[key] = value
  })

  const nextAction =
    request.headers.get('next-action') ||
    request.headers.get('Next-Action') ||
    request.headers.get('NEXT-ACTION')
  const nextRouterStateTree =
    request.headers.get('next-router-state-tree') || request.headers.get('Next-Router-State-Tree')
  const nextRouterPrefetch =
    request.headers.get('next-router-prefetch') || request.headers.get('Next-Router-Prefetch')
  const nextUrl = request.headers.get('next-url') || request.headers.get('Next-Url')
  const rsc = request.headers.get('rsc') || request.headers.get('RSC')
  const contentType = request.headers.get('content-type')
  const host = request.headers.get('host')
  const referer = request.headers.get('referer')
  const userAgent = request.headers.get('user-agent')

  const serverActionInfo = {
    timestamp: new Date().toISOString(),
    method: request.method,
    url: request.url,
    pathname: request.nextUrl.pathname,
    search: request.nextUrl.search,
    host,
    referer,
    userAgent,
    allHeaders, // Log ALL headers to see what's actually being sent
    keyHeaders: {
      'next-action': nextAction,
      'next-router-state-tree': nextRouterStateTree,
      'next-router-prefetch': nextRouterPrefetch,
      'next-url': nextUrl,
      rsc: rsc,
      'content-type': contentType,
    },
    cookies: Object.fromEntries(
      request.cookies.getAll().map((cookie) => [cookie.name, cookie.value]),
    ),
  }

  console.log('='.repeat(80))
  console.log('🔍 SERVER ACTION DETECTED')
  console.log('='.repeat(80))
  console.log(JSON.stringify(serverActionInfo, null, 2))
  console.log('='.repeat(80))

  // Also log the action ID separately for easy searching
  if (nextAction) {
    console.log(`📌 Server Action ID: ${nextAction}`)
  } else {
    console.log('⚠️  No Next-Action header found, but detected as server action by other criteria')
  }
}

/**
 * Middleware for multi-tenant application
 * Handles tenant detection, cookie management, CORS, and server action debugging
 */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const host = request.headers.get('host') || ''
  const cleanHostname = getUrlFromHost(host)

  // Log all POST requests for debugging (to catch server actions)
  if (request.method === 'POST') {
    const allHeaders: Record<string, string> = {}
    request.headers.forEach((value, key) => {
      allHeaders[key] = value
    })

    console.log('📬 POST REQUEST DETECTED:', {
      pathname,
      url: request.url,
      headers: allHeaders,
      timestamp: new Date().toISOString(),
    })

    // Check if it's a server action
    if (isServerActionRequest(request)) {
      logServerAction(request)
    }
  }

  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,DELETE,PATCH,POST,PUT,OPTIONS',
        'Access-Control-Allow-Headers':
          'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Next-Action, Next-Router-State-Tree, Next-Router-Prefetch, Next-Url, RSC, Cookie',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
      },
    })
  }

  // Create response
  const response = NextResponse.next()

  // Set CORS headers for all responses
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  response.headers.set('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT,OPTIONS')
  response.headers.set(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Next-Action, Next-Router-State-Tree, Next-Router-Prefetch, Next-Url, RSC, Cookie',
  )

  // Prevent caching for admin and API routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api')) {
    response.headers.set('Cache-Control', 'no-store, must-revalidate')
  }

  // Store hostname in headers for downstream use
  // This allows server components to access the hostname without parsing
  response.headers.set('x-hostname', cleanHostname)

  return response
}

/**
 * Configure which routes should be processed by middleware
 * Match all routes including static files and images
 */
export const config = {
  matcher: [
    /*
     * Match all request paths
     */
    '/(.*)',
  ],
}

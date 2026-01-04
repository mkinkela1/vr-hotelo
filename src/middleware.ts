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
 */
function isServerActionRequest(request: NextRequest): boolean {
  const nextAction = request.headers.get('next-action')
  const contentType = request.headers.get('content-type') || ''
  const method = request.method

  // Server actions typically:
  // 1. Have Next-Action header
  // 2. Are POST requests with form data or RSC payload
  // 3. May be sent to _next/actions endpoint
  return (
    !!nextAction ||
    (method === 'POST' &&
      (contentType.includes('multipart/form-data') ||
        contentType.includes('text/plain') ||
        request.nextUrl.pathname.includes('_next/actions')))
  )
}

/**
 * Log server action details for debugging
 */
function logServerAction(request: NextRequest) {
  const nextAction = request.headers.get('next-action')
  const nextRouterStateTree = request.headers.get('next-router-state-tree')
  const nextRouterPrefetch = request.headers.get('next-router-prefetch')
  const nextUrl = request.headers.get('next-url')
  const rsc = request.headers.get('rsc')
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
    headers: {
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

  // Log all server action requests for debugging
  if (isServerActionRequest(request)) {
    logServerAction(request)
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
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Middleware leve — sem imports pesados
// A proteção de rotas fica no app/(app)/layout.tsx via auth() server-side
export function middleware(req: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}

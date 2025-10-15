import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Solo aplicar middleware a rutas específicas
  const protectedRoutes = ['/dashboard', '/accounts', '/categories', '/transactions', '/settings'];
  const authRoutes = ['/login', '/register'];
  
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  
  // Si no es una ruta que necesite middleware, continuar
  if (!isProtectedRoute && !isAuthRoute) {
    return NextResponse.next();
  }
  
  // Por ahora, permitir todas las rutas sin verificación de token
  // Esto se puede implementar más tarde cuando tengamos el sistema de auth funcionando
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};

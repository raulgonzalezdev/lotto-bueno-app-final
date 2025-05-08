import { NextResponse } from 'next/server';

// Lista de orígenes permitidos
const allowedOrigins = [
  'https://applottobueno.com',
  'https://www.applottobueno.com',
  'https://banempre.online',
  'https://www.banempre.online',
  'https://ahorasi.online/',
  'https://www.ahorasi.online/',
  'http://localhost:3000',
  'http://localhost:3002',
  'http://localhost:3005',
  
];

// Opciones CORS
const corsOptions = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-CSRF-Token, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version',
  'Access-Control-Allow-Credentials': 'true',
};

export function middleware(request) {
  // Obtener el origen de la solicitud
  const origin = request.headers.get('origin') ?? '';
  const isAllowedOrigin = allowedOrigins.includes(origin);

  // Manejar solicitudes preflight OPTIONS
  const isPreflight = request.method === 'OPTIONS';

  if (isPreflight) {
    const preflightHeaders = {
      'Access-Control-Allow-Origin': isAllowedOrigin ? origin : '*',
      ...corsOptions,
    };
    return new NextResponse(null, { 
      status: 200,
      headers: preflightHeaders 
    });
  }

  // Manejar solicitudes normales
  const response = NextResponse.next();

  // Configurar Access-Control-Allow-Origin
  response.headers.set('Access-Control-Allow-Origin', isAllowedOrigin ? origin : '*');

  // Agregar resto de cabeceras CORS
  Object.entries(corsOptions).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

// Aplicar el middleware a todas las rutas
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}; 
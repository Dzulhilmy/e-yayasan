// middleware.ts (or proxy.ts)
//
// DIAGNOSIS: Your server logs show `login({})` even after the <form action={login}>
// fix — meaning the FormData is empty by the time it reaches the Server Action.
// Request bodies in the Fetch API (which Next.js middleware uses under the hood)
// are ReadableStreams and can only be consumed ONCE. If anything earlier in the
// request pipeline reads the body — even just to log it — the body is gone by
// the time your route/action tries to read it again.
//
// The "proxy.ts: 7ms" segment in your terminal trace is the smoking gun: it means
// a middleware/proxy layer is running on every request to /login, including POSTs.

import { NextRequest, NextResponse } from 'next/server';

// ─────────────────────────────────────────────────────────────────────────────
// ❌ BROKEN — this is almost certainly what's in your proxy.ts / middleware.ts
// ─────────────────────────────────────────────────────────────────────────────
//
// export async function middleware(request: NextRequest) {
//   if (request.method === 'POST') {
//     const data = await request.formData();   // <-- consumes the body stream
//     console.log('Incoming form:', data);      // body is now empty for everyone downstream
//   }
//   return NextResponse.next();
// }
//
// Even something as innocent as `await request.text()` or `await request.json()`
// for logging purposes has the exact same destructive effect.

// ─────────────────────────────────────────────────────────────────────────────
// ✅ FIX OPTION 1 (recommended) — don't touch the body in middleware at all.
// Middleware should only make decisions based on headers, cookies, and the URL.
// Body parsing belongs in the route/Server Action, not middleware.
// ─────────────────────────────────────────────────────────────────────────────

export async function proxy(request: NextRequest) {
  // Example of safe, legitimate middleware logic — auth redirect based on cookie,
  // not body inspection:
  const sessionCookie = request.cookies.get('sb-access-token');
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login');

  if (sessionCookie && isAuthRoute) {
    // Already logged in, bounce away from login page
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/dashboard/:path*', '/admin/:path*'],
};

// ─────────────────────────────────────────────────────────────────────────────
// ✅ FIX OPTION 2 — if you truly must inspect the body in middleware (e.g. for
// logging/audit), clone the request FIRST so the original stream is untouched
// when it continues downstream to your Server Action.
// ─────────────────────────────────────────────────────────────────────────────
//
// export async function middleware(request: NextRequest) {
//   if (request.method === 'POST' && request.nextUrl.pathname === '/login') {
//     const cloned = request.clone();           // clone BEFORE reading
//     const data = await cloned.formData();      // read the clone, not the original
//     console.log('Incoming form (debug only):', Object.fromEntries(data));
//     // `request` itself is still untouched and can be read again downstream
//   }
//   return NextResponse.next();
// }
//
// Note: request.clone() is only safe to call before the body has been read once.
// If anything before this point already called request.formData()/.json()/.text()
// on the original request, the clone will also be empty.
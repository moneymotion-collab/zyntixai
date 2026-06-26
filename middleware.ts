import { type NextRequest } from "next/server"
import { handleMiddleware } from "./edge/middleware-runtime"

export async function middleware(req: NextRequest) {
  return handleMiddleware(req)
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}

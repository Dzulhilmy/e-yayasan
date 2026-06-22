import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || process.env.NEXT_PUBLIC_ADMIN_JWT_SECRET || 'dev_admin_secret_change_me'
const TOKEN_NAME = 'admin_token'
const TOKEN_EXP = '7d'

export function hashPassword(plain: string) {
  return bcrypt.hashSync(plain, 10)
}

export function comparePassword(plain: string, hash: string) {
  try {
    return bcrypt.compareSync(plain, hash)
  } catch (e) {
    return false
  }
}

export function signAdminToken(payload: object) {
  return jwt.sign(payload as any, JWT_SECRET, { expiresIn: TOKEN_EXP })
}

export function verifyAdminToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as any
  } catch (e) {
    return null
  }
}

export function parseCookies(cookieHeader?: string) {
  const out: Record<string,string> = {}
  if (!cookieHeader) return out
  cookieHeader.split(';').forEach((c) => {
    const idx = c.indexOf('=')
    if (idx === -1) return
    const k = c.slice(0, idx).trim()
    const v = c.slice(idx+1).trim()
    out[k] = decodeURIComponent(v)
  })
  return out
}

export { TOKEN_NAME }

import { useCallback } from 'react'

interface CookieOptions {
  maxAge?: number // in seconds
  expires?: Date
  path?: string
  domain?: string
  secure?: boolean
  sameSite?: 'Strict' | 'Lax' | 'None'
}

interface UseCookieReturn {
  getCookie: (name: string) => string | null
  setCookie: (name: string, value: string, options?: CookieOptions) => void
  deleteCookie: (name: string, options?: Partial<CookieOptions>) => void
  getAllCookies: () => Record<string, string>
  clearAllCookies: () => void
}

export const useCookie = (): UseCookieReturn => {
  // Get a cookie by name
  const getCookie = useCallback((name: string): string | null => {
    if (typeof document === 'undefined') return null

    const nameEQ = name + '='
    const cookies = document.cookie.split(';')

    for (let cookie of cookies) {
      cookie = cookie.trim()
      if (cookie.startsWith(nameEQ)) {
        const value = cookie.substring(nameEQ.length)
        try {
          return decodeURIComponent(value)
        } catch (e) {
          return value
        }
      }
    }

    return null
  }, [])

  // Set a cookie with options
  const setCookie = useCallback((name: string, value: string, options?: CookieOptions): void => {
    if (typeof document === 'undefined') return

    let cookieString = `${name}=${encodeURIComponent(value)}`

    if (options) {
      if (options.maxAge) {
        cookieString += `; max-age=${options.maxAge}`
      }

      if (options.expires) {
        cookieString += `; expires=${options.expires.toUTCString()}`
      }

      if (options.path) {
        cookieString += `; path=${options.path}`
      } else {
        cookieString += '; path=/'
      }

      if (options.domain) {
        cookieString += `; domain=${options.domain}`
      }

      if (options.secure) {
        cookieString += '; secure'
      }

      if (options.sameSite) {
        cookieString += `; samesite=${options.sameSite}`
      }
    } else {
      // Default path
      cookieString += '; path=/'
    }

    document.cookie = cookieString
  }, [])

  // Delete a cookie
  const deleteCookie = useCallback((name: string, options?: Partial<CookieOptions>): void => {
    if (typeof document === 'undefined') return

    let cookieString = `${name}=; max-age=0`

    if (options?.path) {
      cookieString += `; path=${options.path}`
    } else {
      cookieString += '; path=/'
    }

    if (options?.domain) {
      cookieString += `; domain=${options.domain}`
    }

    document.cookie = cookieString
  }, [])

  // Get all cookies as an object
  const getAllCookies = useCallback((): Record<string, string> => {
    if (typeof document === 'undefined') return {}

    const cookies: Record<string, string> = {}
    const allCookies = document.cookie.split(';')

    for (let cookie of allCookies) {
      cookie = cookie.trim()
      if (cookie) {
        const [name, value] = cookie.split('=')
        try {
          cookies[name] = decodeURIComponent(value)
        } catch (e) {
          cookies[name] = value
        }
      }
    }

    return cookies
  }, [])

  // Clear all cookies
  const clearAllCookies = useCallback((): void => {
    if (typeof document === 'undefined') return

    const cookies = document.cookie.split(';')
    for (let cookie of cookies) {
      const eqPos = cookie.indexOf('=')
      const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim()
      document.cookie = `${name}=; max-age=0; path=/`
    }
  }, [])

  return {
    getCookie,
    setCookie,
    deleteCookie,
    getAllCookies,
    clearAllCookies,
  }
}

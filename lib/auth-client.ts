// Client-side authentication utilities

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

export function getBusiness(): any | null {
  if (typeof window === 'undefined') return null
  const business = localStorage.getItem('business')
  if (!business) return null
  try {
    return JSON.parse(business)
  } catch {
    return null
  }
}

export function isAuthenticated(): boolean {
  return !!getToken()
}

export function logout(): void {
  // Clear localStorage
  localStorage.removeItem('token')
  localStorage.removeItem('business')
  
  // Clear cookie
  document.cookie = 'token=; path=/; max-age=0'
  
  // Redirect to login
  window.location.href = '/login'
}

export function setAuthData(token: string, business: any): void {
  // Store in localStorage
  localStorage.setItem('token', token)
  localStorage.setItem('business', JSON.stringify(business))
  
  // Store token in cookie for middleware
  document.cookie = `token=${token}; path=/; max-age=${30 * 24 * 60 * 60}` // 30 days
}
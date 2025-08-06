export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') {
    return generateSessionId()
  }
  
  const SESSION_KEY = 'chatbot_session_id'
  let sessionId = localStorage.getItem(SESSION_KEY)
  
  if (!sessionId) {
    sessionId = generateSessionId()
    localStorage.setItem(SESSION_KEY, sessionId)
  }
  
  return sessionId
}

export function clearSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('chatbot_session_id')
  }
}
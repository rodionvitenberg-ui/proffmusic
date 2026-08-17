export function apiBase(apiUrl: string, isDev: boolean): string {
  const configured = String(apiUrl || '').replace(/\/$/, '')
  if (configured) return configured
  return isDev ? 'http://127.0.0.1:8000' : ''
}

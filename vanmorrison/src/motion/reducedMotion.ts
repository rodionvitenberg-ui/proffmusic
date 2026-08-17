export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function hasSplashCookie(): boolean {
  return document.cookie.split(';').some((c) => c.trim().startsWith('vm_splash_seen='))
}

export function setSplashCookie() {
  document.cookie = 'vm_splash_seen=1; path=/; SameSite=Lax; max-age=31536000'
}

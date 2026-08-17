import assert from 'node:assert/strict'

function apiBase(apiUrl, isDev) {
  const configured = String(apiUrl || '').replace(/\/$/, '')
  if (configured) return configured
  return isDev ? 'http://127.0.0.1:8000' : ''
}

assert.equal(apiBase('https://proffmusic.shop', false), 'https://proffmusic.shop')
assert.equal(apiBase('', true), 'http://127.0.0.1:8000')
assert.equal(apiBase('', false), '')
assert.equal(apiBase('http://127.0.0.1:8000/', true), 'http://127.0.0.1:8000')
console.log('apiBase ok')

#!/usr/bin/env node
/** Re-download fonts, static images, videos, catalog/news snapshots. */
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/128.0.0.0 Safari/537.36'

async function grab(url, dest) {
  await mkdir(dirname(dest), { recursive: true })
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  await writeFile(dest, Buffer.from(await res.arrayBuffer()))
  console.log('ok', dest)
}

const staticFiles = [
  'fonts/inria-serif/InriaSerif-Regular.ttf',
  'fonts/inria-serif/InriaSerif-Bold.ttf',
  'fonts/oswald/Oswald-Regular.ttf',
  'fonts/oswald/Oswald-Bold.ttf',
  'images/orangefield-records-logo.svg',
  'images/van-morrison-live-at-orangefield.webp',
  'images/new-album-shadow-left.webp',
  'images/new-album-shadow-right.webp',
  'images/footer/vm-footer-1.webp',
  'images/footer/vm-footer-2.webp',
  'images/footer/vm-footer-3.webp',
  'images/footer/vm-footer-4.webp',
  'images/footer/vm-footer-5.webp',
  'images/footer/vm-footer-6.webp',
  'images/footer/vm-footer-7.webp',
  'images/footer/vm-footer-8.webp',
]

for (const f of staticFiles) {
  const src = f.startsWith('fonts/')
    ? `https://vanmorrison.com/build/${f}`
    : `https://vanmorrison.com/build/${f}`
  await grab(src, join(root, f))
}

await grab('https://vanmorrison.com/news.json', join(root, 'news.json'))
await grab('https://van-morrison.s3-assets.com/vm-homepage-hero.mp4', join(root, 'media/video/vm-homepage-hero.mp4'))
await grab('https://van-morrison.s3-assets.com/vm-concert-vault-makin-whoopie-v2.mp4', join(root, 'media/video/vault-bg.mp4'))
await grab('https://van-morrison.s3-assets.com/Astral-Weeks-Trim-2.mp4', join(root, 'media/video/astral-weeks.mp4'))
console.log('done')

import type { Album, NewsItem } from '../types'

export function albumCover(album: Album): string {
  return `/media/albums/${album.slug}.webp`
}

export function albumCoverFallback(album: Album): string {
  return album.image?.src || album.img
}

export function newsCover(item: NewsItem): string {
  return `/media/news/${item.id}.webp`
}

export function newsCoverFallback(item: NewsItem, slot: 'card' | 'featured' = 'card'): string {
  const fromSlot = item.featuredImage?.[slot]?.src
  return fromSlot || item.featuredImageUrl || ''
}

export function onImgError(event: Event, fallback: string) {
  const img = event.target as HTMLImageElement
  if (fallback && !img.dataset.fallbackApplied) {
    img.dataset.fallbackApplied = '1'
    img.src = fallback
  }
}

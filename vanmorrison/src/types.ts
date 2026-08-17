export type Track = {
  number: string
  title: string
  disc: string | null
}

export type AlbumImage = {
  src: string
  srcset?: string
  archiveSizes?: string
  heroSizes?: string
  preload?: string
}

export type Album = {
  id: number
  slug: string
  title: string
  img: string
  image: AlbumImage
  year: string
  released: string
  description: string
  backgroundColour: string
  invertHeader: boolean
  albumIntro: string
  tracklist: Track[]
  listenSpotify?: string | null
  listenAppleMusic?: string | null
  listenAmazonMusic?: string | null
  listenYoutubeMusic?: string | null
  officialStore?: string | null
  showBuyOnline: boolean
  buyButtonText: string
  seoTitle?: string
}

export type Show = {
  date: string | null
  day: string
  month: string
  venue: string
  location: string
  href: string | null
  soldOut: boolean
  label: string
}

export type NewsImageSlot = {
  src: string
  srcset?: string
  sizes?: string
  width?: number
  height?: number
}

export type NewsItem = {
  id: number
  title: string
  slug: string
  url: string
  postDate: string
  excerpt: string
  newsType: string
  backgroundColour: string | null
  invertTextColour: boolean
  featuredImageUrl: string | null
  featuredImage: {
    card?: NewsImageSlot
    featured?: NewsImageSlot
  } | null
  ctaLabel?: string | null
  ctaUrl?: string | null
  ctaTarget?: string | null
  isFeaturedNewsArticle: boolean
  featuredUseCustomData?: boolean
  featuredTitle?: string | null
  featuredPrimaryCtaLabel?: string | null
  featuredPrimaryCtaUrl?: string | null
  featuredPrimaryCtaTarget?: string | null
  featuredSecondaryCtaLabel?: string | null
  featuredSecondaryCtaUrl?: string | null
  featuredSecondaryCtaTarget?: string | null
}

export type ViewMode = 'timeline' | 'grid'

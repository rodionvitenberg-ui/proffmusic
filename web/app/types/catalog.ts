export type Category = {
  id: number
  name: string
  slug: string
}

export type Tag = {
  id: number
  name: string
  slug: string
  tag_type: 'mood' | 'instrument' | 'usage' | string
}

export type Track = {
  id: number
  title: string
  slug: string
  price: string | number
  purchases_count?: number
  cover_image?: string
  audio_file_preview?: string
  duration?: string
  category?: Category
  tags?: Tag[]
  description_short?: string
  description_full?: string
  is_new?: boolean
  is_popular?: boolean
}

export type Collection = {
  id: number
  title: string
  slug: string
  cover_image?: string
  price: string | number
  description?: string
  tracks?: Track[]
  is_new?: boolean
}

export type CartItem = {
  id: number
  type: 'track' | 'collection'
  title: string
  price: number
  image?: string
  slug: string
  cartId: string
}

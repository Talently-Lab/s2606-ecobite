export interface Restaurant {
  id: number
  name: string
  imageUrl?: string | null
  address: string
  biodegradablePackaging: boolean
  ecoIndicator: string
  latitude: number | null
  longitude: number | null
}

export interface FeaturedDish {
  imageUrl?: string | null
  id: number
  name: string
  price: number
  co2SavedPerUnit: number
  category: string | null
  restaurant: Pick<Restaurant, 'id' | 'name' | 'ecoIndicator' | 'biodegradablePackaging'>
}

export interface HomeData {
  communityImpact?: { co2SavedKg: number } | null
  userImpact: { co2SavedKg: number } | null
  categories: { id: number; name: string; slug: string }[]
  restaurants: Restaurant[]
  featuredDishes: FeaturedDish[]
  howItWorks: { step: number; title: string; description: string }[]
}

export interface HomeResponse {
  message: string
  data: HomeData
}

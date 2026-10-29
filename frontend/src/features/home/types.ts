export interface Restaurant {
  id: number
  name: string
  address: string
  biodegradablePackaging: boolean
  ecoIndicator: string
}

export interface FeaturedDish {
  id: number
  name: string
  price: number
  co2SavedPerUnit: number
  category: string | null
  restaurant: Pick<Restaurant, 'id' | 'name' | 'ecoIndicator' | 'biodegradablePackaging'>
}

export interface HomeData {
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

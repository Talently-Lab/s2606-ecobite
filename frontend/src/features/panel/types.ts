export interface CheckoutItemInput {
  dishId: number
  quantity: number
}

export interface CheckoutRequest {
  restaurantId: number
  zone: string
  items: CheckoutItemInput[]
}

export interface CheckoutQuoteItem {
  dishId: number
  name: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface CheckoutQuote {
  restaurantId: number
  restaurantName: string
  zone: string
  items: CheckoutQuoteItem[]
  subtotal: number
  deliveryFee: number | null
  total: number | null
  environmentalImpact: { co2SavedKg: number } | null
  requiresEnvironmentalRules: boolean
}

export interface OrderConfirmationItem {
  dishId: number
  name: string
  quantity: number
  unitPrice: number
  subtotal: number
  co2SavedKg: number
  packagingType: string
}

export interface OrderConfirmation {
  id: number
  date: string
  status: string
  total: number
  zone: string
  restaurant: { id: number; name: string }
  items: OrderConfirmationItem[]
  environmentalImpact: { co2SavedKg: number } | null
}

export interface MyImpact {
  co2SavedKg: number
  ordersCount: number
}

export interface ConfirmationData {
  order: OrderConfirmation
  myImpact: MyImpact
}

export interface AdminDashboard {
  summary: {
    co2SavedKg: number
    ordersCount: number
    activeRestaurantsCount: number
    averageTicket: number
  }
  recentOrders: Array<{
    id: number
    date: string
    customer: string
    restaurant: string
    zone: string
    total: number
    co2SavedKg: number | null
    status: string
  }>
}

export interface ApiResult<T> {
  message: string
  data: T
}

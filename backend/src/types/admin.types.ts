export interface AdminDashboardSummaryDto {
  co2SavedKg: number;
  ordersCount: number;
  activeRestaurantsCount: number;
  averageTicket: number;
}

export interface AdminRecentOrderDto {
  id: number;
  date: string;
  customer: string;
  restaurant: string;
  zone: string;
  total: number;
  co2SavedKg: number | null;
  status: string;
}

export interface AdminDashboardDto {
  summary: AdminDashboardSummaryDto;
  recentOrders: AdminRecentOrderDto[];
}

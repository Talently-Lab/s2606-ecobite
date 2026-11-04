export interface RestaurantRatingDto {
  id: number;
  score: number;
  comment: string | null;
  createdAt: string;
}

export interface RestaurantRatingsResponse {
  averageScore: number;
  totalRatings: number;
  ratings: RestaurantRatingDto[];
}
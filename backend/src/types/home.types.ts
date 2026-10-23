
export interface UserImpactDto {
  co2SavedKg: number;
}

export interface CategoryDto {
  id: number;
  name: string;
  slug: string;
}

export interface RestaurantDto {
  id: number;
  name: string;
  address: string;
  biodegradablePackaging: boolean;
  ecoIndicator: string;
}

export interface FeaturedDishDto {
  id: number;
  name: string;
  price: number;
  co2SavedPerUnit: number;
  category: string | null;
  restaurant: {
    id: number;
    name: string;
    ecoIndicator: string;
    biodegradablePackaging: boolean;
  };
}

export interface EducationalStepDto {
  step: number;
  title: string;
  description: string;
}

export interface HomeResponse {
  userImpact: UserImpactDto | null;
  categories: CategoryDto[];
  restaurants: RestaurantDto[];
  featuredDishes: FeaturedDishDto[];
  howItWorks: EducationalStepDto[];
}

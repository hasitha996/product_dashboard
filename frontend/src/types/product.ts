export interface Category {
  id: number;
  name: string;
  slug?: string;
}

export interface ProductImage {
  id?: number;
  url: string;
  path?: string;
  name?: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  rating?: number | null;
  category_id: number;
  category?: Category | string | null;
  image?: string | ProductImage | null;
  image_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ProductFilters {
  search?: string;
  category_id?: number | "";
  min_price?: number | "";
  max_price?: number | "";
  sort_by?: "name" | "price" | "rating" | "created_at";
  sort_order?: "asc" | "desc";
  page?: number;
  per_page?: number;
}

export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
  path?: string;
  links?: PaginationLink[];
}

export interface PaginatedResponse<T> {
  data: T[];
  links?: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta?: PaginationMeta;
}

export interface ProductFormData {
  name: string;
  description?: string;
  price: number;
  rating?: number | null;
  category_id: number;
  image?: File | null;
}

export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}
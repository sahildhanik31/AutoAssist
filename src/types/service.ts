// src/types/service.ts
import type { ServiceBookingDraft } from "./workflow";

export interface ServiceCategory {
  id: string;
  title: string;
  description: string;
  iconName: string;
  color: string;
  displayOrder: number;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  price: number;
  mandatory: boolean;
  defaultSelected: boolean;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  price: number;
  originalPrice?: number;
  duration: string;
  warranty: string;
  rating: number;
  reviews: number;

  serviceItems: ServiceItem[];

  recommended: boolean;
  popular?: boolean;
}

export interface OilBrand {
  id: string;
  name: string;
  image: string;
  viscosity: string;
  quantity: string;
  price: number;
  rating: number;
  reviews: number;
  compatibleBrands: string[];
  description?: string;
  recommended?: boolean;
}

export interface OilCategory {
  id: string;
  title: string;
  description: string;
  image: string;
  brands: OilBrand[];
}

export interface TyreOption {
  id: string;
  size: string;
  price: number;
  warranty: string;
  tubeless: boolean;
  rating: number;
  reviews: number;
  compatibleVehicles: string[];
  inStock: boolean;
}

export interface TyreBrand {
  brandId: string;
  name: string;
  image: string;
  description?: string;
  countryOfOrigin?: string;
  options: TyreOption[];
}

export interface AddOnService {
  id: string;
  title: string;
  description: string;
  image: string;
  price: number;
  duration: string;
  category?: string;
  rating?: number;
  reviews?: number;
  recommended?: boolean;
}

export interface BatteryOption {
  batteryModel: string;
  capacity: string;
  voltage: string;
  technology: string;
  price: number;
  installationCharge: number;
  totalPrice: number;
  warranty: string;
  rating: number;
  reviews: number;
  recommended: boolean;
  compatibleCars: string[];
  availability: string;
  inStock: boolean;
}

export interface BatteryBrand {
  serviceId: string;
  brandId: string;
  brandName: string;
  country: string;
  description: string;
  logo: string;
  options: BatteryOption[];
}

export interface CarWashPackage {
  serviceId: string;
  packageId: string;
  title: string;
  description: string;
  image: string;
  duration: string;
  price: number;
  discountPrice: number;
  rating: number;
  reviews: number;
  recommended: boolean;
  included: string[];
  excluded: string[];
}

export interface DentPaintPanel {
  serviceId: string;
  panelId: string;
  title: string;
  price: number;
  duration: string;
  paintWarranty: string;
  rating: number;
  reviews: number;
  recommended: boolean;
  included: string[];
  excluded: string[];
}

export interface RoadsideService {
  serviceId: string;
  id: string;
  title: string;
  description: string;
  iconName: string;
  estimatedArrival: string;
  availability: string;
  price: number;
  comingSoon: boolean;
}

export interface BookingPayload extends ServiceBookingDraft {
  vehicleId?: string;
selectedVehicleId?: string;
}

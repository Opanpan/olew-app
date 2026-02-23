export type ProductCategory = 'bottle' | 'cap';

export type BottleType =
  | 'Dropper Bottle'
  | 'Pump Bottle'
  | 'Spray Bottle'
  | 'Roll-on Bottle'
  | 'Jar'
  | 'Vial';

export type CapType =
  | 'Dropper Cap'
  | 'Pump Cap'
  | 'Spray Cap'
  | 'Screw Cap'
  | 'Flip Cap'
  | 'Magnetic Cap';

export interface ProductDimensions {
  weight: number; // grams
  width: number; // mm
  height: number; // mm
  capacity?: number; // ml (for bottles)
}

export interface ProductBase {
  id: string;
  name: string;
  type: BottleType | CapType;
  dimensions: ProductDimensions;
  image?: string;
  colors: string[];
  featured?: boolean;
  newArrival?: boolean;
  bestSeller?: boolean;
}

export interface Bottle extends ProductBase {
  category: 'bottle';
  type: BottleType;
}

export interface Cap extends ProductBase {
  category: 'cap';
  type: CapType;
}

export type Product = Bottle | Cap;

export interface FilterState {
  types: string[];
  weightRange: [number, number];
  widthRange: [number, number];
  heightRange: [number, number];
  searchQuery: string;
  sortBy: 'name' | 'newest';
}

/**
 * Phase 4: Bill of Materials (BOM) Type Definitions
 *
 * This file defines all TypeScript interfaces for the BOM system.
 */

// Removed unused import

// ============================================================================
// BOM Item Types
// ============================================================================

export type BOMCategory =
  | 'lumber'
  | 'hardware'
  | 'electrical'
  | 'plumbing'
  | 'finishing'
  | 'concrete'
  | 'decking'
  | 'roofing'
  | 'landscaping'
  | 'other';

export type BOMUnit =
  | 'each'
  | 'linear_ft'
  | 'sq_ft'
  | 'box'
  | 'bag'
  | 'gallon'
  | 'lb'
  | 'roll'
  | 'sheet';

export type SupplierName = 'home_depot' | 'lowes' | 'menards' | 'local' | 'other';

export type PriceSource = 'ai_estimate' | 'supplier_api' | 'manual' | 'user_input';

export interface BOMItem {
  id: string;
  name: string;
  description: string;
  category: BOMCategory;
  quantity: number;
  unit: BOMUnit;
  unitPrice: number;
  totalPrice: number;
  sku?: string;
  supplier?: SupplierName;
  alternatives?: AlternativeBOMItem[];
  notes?: string;
  wasteFactor: number; // e.g., 1.10 for 10% waste allowance
  link?: string; // Product URL
}

export interface AlternativeBOMItem {
  name: string;
  sku?: string;
  unitPrice: number;
  supplier?: SupplierName;
  notes?: string;
}

// ============================================================================
// BOM Category Grouping
// ============================================================================

export interface BOMCategoryGroup {
  name: string;
  category: BOMCategory;
  items: BOMItem[];
  subtotal: number;
  itemCount: number;
}

// ============================================================================
// Bill of Materials
// ============================================================================

export interface BillOfMaterials {
  id: string;
  projectId: string;
  items: BOMItem[];
  categories: BOMCategoryGroup[];

  // Cost breakdown
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  contingency: number; // 10-15% buffer for unforeseen costs
  laborEstimate?: number;
  grandTotal: number;

  // Metadata
  generatedAt: string;
  generatedBy: string;
  priceSource: PriceSource;
  lastPriceUpdate?: string;
  notes?: string;
}

// ============================================================================
// BOM Export Types
// ============================================================================

export interface BOMExportOptions {
  format: 'csv' | 'pdf' | 'excel';
  includeAlternatives: boolean;
  includePricing: boolean;
  includeNotes: boolean;
  groupByCategory: boolean;
}

export interface BOMExportResult {
  filename: string;
  data: string | Blob;
  mimeType: string;
}

// ============================================================================
// Material Calculation Formulas
// ============================================================================

export interface MaterialCalculation {
  formula: string;
  description: string;
  inputs: Record<string, number>;
  result: number;
  wasteFactor: number;
  finalQuantity: number;
}

// Specific calculation interfaces
export interface DeckBoardCalculation {
  deckLength: number; // feet
  deckWidth: number; // feet
  boardWidth: number; // inches
  boardLength: number; // feet
  wasteFactor: number;
}

export interface JoistCalculation {
  deckLength: number; // feet
  joistSpacing: number; // inches (typically 16)
  wasteFactor: number;
}

export interface ConcreteCalculation {
  footingDiameter: number; // inches
  footingDepth: number; // inches
  numberOfFootings: number;
  wasteFactor: number;
}

export interface ScrewCalculation {
  deckAreaSqFt: number;
  screwsPer100SqFt: number; // typically 350 for decking
}

// ============================================================================
// Supplier Integration Types
// ============================================================================

export interface SupplierProduct {
  sku: string;
  name: string;
  price: number;
  inStock: boolean;
  storeLocation?: string;
  supplier: SupplierName;
  url?: string;
}

export interface SupplierSearchResult {
  products: SupplierProduct[];
  totalResults: number;
  query: string;
}

export interface ShoppingList {
  id: string;
  bomId: string;
  supplier: SupplierName;
  items: ShoppingListItem[];
  totalPrice: number;
  listUrl?: string;
  createdAt: string;
}

export interface ShoppingListItem {
  bomItemId: string;
  productSku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  inStock: boolean;
}

// ============================================================================
// BOM Validation Types
// ============================================================================

export interface BOMValidationResult {
  isValid: boolean;
  errors: BOMValidationError[];
  warnings: BOMValidationWarning[];
}

export interface BOMValidationError {
  itemId: string;
  field: string;
  message: string;
}

export interface BOMValidationWarning {
  itemId: string;
  message: string;
  suggestion?: string;
}

// ============================================================================
// Helper Functions Types
// ============================================================================

export interface BOMStatistics {
  totalItems: number;
  totalCategories: number;
  mostExpensiveItem: BOMItem;
  leastExpensiveItem: BOMItem;
  averageItemCost: number;
  categoryBreakdown: Array<{
    category: BOMCategory;
    itemCount: number;
    totalCost: number;
    percentage: number;
  }>;
}

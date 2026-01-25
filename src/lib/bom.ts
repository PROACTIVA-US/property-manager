/**
 * Phase 4: Bill of Materials (BOM) Calculation Library
 *
 * Provides utility functions for BOM operations, calculations, and exports.
 */

import type {
  BillOfMaterials,
  BOMItem,
  BOMCategoryGroup,
  BOMCategory,
  BOMExportOptions,
  BOMStatistics,
  BOMValidationResult,
} from '../types/bom.types';

// ============================================================================
// BOM CRUD Operations
// ============================================================================

const STORAGE_KEY = 'propertymanager_boms';

/**
 * Get all BOMs from localStorage
 */
export function getAllBOMs(): BillOfMaterials[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

/**
 * Get BOM by ID
 */
export function getBOMById(id: string): BillOfMaterials | undefined {
  return getAllBOMs().find((bom) => bom.id === id);
}

/**
 * Get BOM by project ID
 */
export function getBOMByProjectId(projectId: string): BillOfMaterials | undefined {
  return getAllBOMs().find((bom) => bom.projectId === projectId);
}

/**
 * Save BOM
 */
export function saveBOM(bom: BillOfMaterials): void {
  const boms = getAllBOMs();
  const index = boms.findIndex((b) => b.id === bom.id);

  if (index !== -1) {
    boms[index] = bom;
  } else {
    boms.push(bom);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(boms));
}

/**
 * Delete BOM
 */
export function deleteBOM(id: string): void {
  const boms = getAllBOMs().filter((bom) => bom.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(boms));
}

// ============================================================================
// BOM Calculations
// ============================================================================

/**
 * Recalculate BOM totals
 */
export function recalculateBOM(bom: BillOfMaterials): BillOfMaterials {
  // Recalculate item totals
  const items = bom.items.map((item) => ({
    ...item,
    totalPrice: item.quantity * item.unitPrice * item.wasteFactor,
  }));

  // Recalculate category groupsconst categoryMap = new Map<BOMCategory, BOMItem[]>();
  items.forEach((item) => {
    if (!categoryMap.has(item.category)) {
      categoryMap.set(item.category, []);
    }
    categoryMap.get(item.category)!.push(item);
  });

  const categories: BOMCategoryGroup[] = Array.from(categoryMap.entries()).map(
    ([category, categoryItems]) => ({
      name: getCategoryLabel(category),
      category,
      items: categoryItems,
      subtotal: categoryItems.reduce((sum, item) => sum + item.totalPrice, 0),
      itemCount: categoryItems.length,
    })
  );

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const taxAmount = subtotal * bom.taxRate;
  const grandTotal = subtotal + taxAmount + bom.contingency + (bom.laborEstimate || 0);

  return {
    ...bom,
    items,
    categories,
    subtotal,
    taxAmount,
    grandTotal,
  };
}

/**
 * Add item to BOM
 */
export function addBOMItem(bom: BillOfMaterials, item: Omit<BOMItem, 'id' | 'totalPrice'>): BillOfMaterials {
  const newItem: BOMItem = {
    ...item,
    id: `bom_item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    totalPrice: item.quantity * item.unitPrice * item.wasteFactor,
  };

  return recalculateBOM({
    ...bom,
    items: [...bom.items, newItem],
  });
}

/**
 * Update BOM item
 */
export function updateBOMItem(
  bom: BillOfMaterials,
  itemId: string,
  updates: Partial<BOMItem>
): BillOfMaterials {
  return recalculateBOM({
    ...bom,
    items: bom.items.map((item) =>
      item.id === itemId ? { ...item, ...updates } : item
    ),
  });
}

/**
 * Remove BOM item
 */
export function removeBOMItem(bom: BillOfMaterials, itemId: string): BillOfMaterials {
  return recalculateBOM({
    ...bom,
    items: bom.items.filter((item) => item.id !== itemId),
  });
}

// ============================================================================
// BOM Export
// ============================================================================

/**
 * Export BOM to CSV format
 */
export function exportBOMToCSV(bom: BillOfMaterials, options: Partial<BOMExportOptions> = {}): string {
  const {
    groupByCategory = true,
    includePricing = true,
    includeNotes = true,
  } = options;

  const lines: string[] = [];

  // Header
  const headers = ['Name', 'Description', 'Category', 'Quantity', 'Unit'];
  if (includePricing) {
    headers.push('Unit Price', 'Waste Factor', 'Total Price');
  }
  if (includeNotes) {
    headers.push('Notes');
  }
  lines.push(headers.join(','));

  // Items
  const items = groupByCategory
    ? bom.categories.flatMap((cat) => cat.items)
    : bom.items;

  items.forEach((item) => {
    const row = [
      escapeCSV(item.name),
      escapeCSV(item.description),
      escapeCSV(item.category),
      item.quantity.toString(),
      escapeCSV(item.unit),
    ];

    if (includePricing) {
      row.push(
        `$${item.unitPrice.toFixed(2)}`,
        item.wasteFactor.toString(),
        `$${item.totalPrice.toFixed(2)}`
      );
    }

    if (includeNotes && item.notes) {
      row.push(escapeCSV(item.notes));
    }

    lines.push(row.join(','));
  });

  // Summary
  if (includePricing) {
    lines.push('');
    lines.push(`Subtotal,,,,,,$${bom.subtotal.toFixed(2)}`);
    lines.push(`Tax (${(bom.taxRate * 100).toFixed(1)}%),,,,,,$${bom.taxAmount.toFixed(2)}`);
    lines.push(`Contingency,,,,,,$${bom.contingency.toFixed(2)}`);
    if (bom.laborEstimate) {
      lines.push(`Labor Estimate,,,,,,$${bom.laborEstimate.toFixed(2)}`);
    }
    lines.push(`Grand Total,,,,,,$${bom.grandTotal.toFixed(2)}`);
  }

  return lines.join('\n');
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Download BOM as CSV file
 */
export function downloadBOMAsCSV(bom: BillOfMaterials, filename?: string): void {
  const csv = exportBOMToCSV(bom);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `bom_${bom.id}_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ============================================================================
// BOM Validation
// ============================================================================

/**
 * Validate BOM completeness and correctness
 */
export function validateBOM(bom: BillOfMaterials): BOMValidationResult {
  const errors: BOMValidationResult['errors'] = [];
  const warnings: BOMValidationResult['warnings'] = [];

  // Validate items
  bom.items.forEach((item) => {
    if (!item.name || item.name.trim() === '') {
      errors.push({
        itemId: item.id,
        field: 'name',
        message: 'Item name is required',
      });
    }

    if (item.quantity <= 0) {
      errors.push({
        itemId: item.id,
        field: 'quantity',
        message: 'Quantity must be greater than 0',
      });
    }

    if (item.unitPrice < 0) {
      errors.push({
        itemId: item.id,
        field: 'unitPrice',
        message: 'Unit price cannot be negative',
      });
    }

    if (item.unitPrice === 0) {
      warnings.push({
        itemId: item.id,
        message: 'Unit price is $0 - verify this is correct',
        suggestion: 'Update pricing with actual market values',
      });
    }

    if (item.wasteFactor < 1) {
      warnings.push({
        itemId: item.id,
        message: 'Waste factor is less than 1.0 - no waste allowance',
        suggestion: 'Consider adding 5-10% waste allowance',
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================================
// BOM Statistics
// ============================================================================

/**
 * Calculate BOM statistics
 */
export function calculateBOMStatistics(bom: BillOfMaterials): BOMStatistics {
  if (bom.items.length === 0) {
    return {
      totalItems: 0,
      totalCategories: 0,
      mostExpensiveItem: {} as BOMItem,
      leastExpensiveItem: {} as BOMItem,
      averageItemCost: 0,
      categoryBreakdown: [],
    };
  }

  const sortedByPrice = [...bom.items].sort((a, b) => b.totalPrice - a.totalPrice);

  return {
    totalItems: bom.items.length,
    totalCategories: bom.categories.length,
    mostExpensiveItem: sortedByPrice[0],
    leastExpensiveItem: sortedByPrice[sortedByPrice.length - 1],
    averageItemCost: bom.subtotal / bom.items.length,
    categoryBreakdown: bom.categories.map((cat) => ({
      category: cat.category,
      itemCount: cat.itemCount,
      totalCost: cat.subtotal,
      percentage: (cat.subtotal / bom.subtotal) * 100,
    })),
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

export function getCategoryLabel(category: BOMCategory): string {
  const labels: Record<BOMCategory, string> = {
    lumber: 'Lumber & Framing',
    hardware: 'Hardware & Fasteners',
    electrical: 'Electrical',
    plumbing: 'Plumbing',
    finishing: 'Finishing Materials',
    concrete: 'Concrete & Masonry',
    decking: 'Decking Materials',
    roofing: 'Roofing',
    landscaping: 'Landscaping',
    other: 'Other Materials',
  };
  return labels[category] || category;
}

export function getCategoryIcon(category: BOMCategory): string {
  const icons: Record<BOMCategory, string> = {
    lumber: '🪵',
    hardware: '🔩',
    electrical: '⚡',
    plumbing: '🚿',
    finishing: '🎨',
    concrete: '🧱',
    decking: '🏗️',
    roofing: '🏠',
    landscaping: '🌳',
    other: '📦',
  };
  return icons[category] || '📦';
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatQuantity(quantity: number, unit: string): string {
  if (quantity % 1 === 0) {
    return `${quantity} ${unit}`;
  }
  return `${quantity.toFixed(2)} ${unit}`;
}

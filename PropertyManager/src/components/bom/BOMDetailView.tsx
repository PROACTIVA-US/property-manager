import { useState } from 'react';
import { Receipt, DollarSign, TrendingUp, Download } from 'lucide-react';
import BOMCategoryExpander from './BOMCategoryExpander';
import BOMExport from './BOMExport';
import type { BillOfMaterials } from '../../types/bom.types';

interface BOMDetailViewProps {
  bom: BillOfMaterials;
  showExport?: boolean;
}

export default function BOMDetailView({ bom, showExport = true }: BOMDetailViewProps) {
  const [showExportPanel, setShowExportPanel] = useState(false);

  return (
    <div className="space-y-4">
      {/* BOM Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Receipt className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Bill of Materials</h3>
              <p className="text-sm text-gray-600">
                {bom.items.length} items across {bom.categories.length} categories
              </p>
            </div>
          </div>
          {showExport && (
            <button
              onClick={() => setShowExportPanel(!showExportPanel)}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Export</span>
            </button>
          )}
        </div>

        {/* Cost Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center space-x-2 mb-1">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <span className="text-xs text-gray-500 uppercase tracking-wide">Materials</span>
            </div>
            <p className="text-lg font-bold text-gray-900">${bom.subtotal.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center space-x-2 mb-1">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <span className="text-xs text-gray-500 uppercase tracking-wide">Tax ({(bom.taxRate * 100).toFixed(1)}%)</span>
            </div>
            <p className="text-lg font-bold text-gray-900">${bom.taxAmount.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center space-x-2 mb-1">
              <TrendingUp className="h-4 w-4 text-gray-500" />
              <span className="text-xs text-gray-500 uppercase tracking-wide">Contingency</span>
            </div>
            <p className="text-lg font-bold text-gray-900">${bom.contingency.toFixed(2)}</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-3 border border-green-600">
            <div className="flex items-center space-x-2 mb-1">
              <DollarSign className="h-4 w-4 text-white" />
              <span className="text-xs text-white uppercase tracking-wide font-medium">Grand Total</span>
            </div>
            <p className="text-lg font-bold text-white">${bom.grandTotal.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Export Panel */}
      {showExportPanel && showExport && (
        <div className="animate-fadeIn">
          <BOMExport bom={bom} />
        </div>
      )}

      {/* Category Groups */}
      <div className="space-y-3">
        {bom.categories.map((categoryGroup, index) => (
          <BOMCategoryExpander key={index} categoryGroup={categoryGroup} />
        ))}
      </div>

      {/* Footer Notes */}
      {bom.notes && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-yellow-900 mb-2">📝 Notes</h4>
          <p className="text-sm text-yellow-800 whitespace-pre-wrap">{bom.notes}</p>
        </div>
      )}

      {/* Metadata */}
      <div className="text-xs text-gray-500 border-t border-gray-200 pt-3 mt-4">
        <div className="flex items-center justify-between">
          <div>
            Generated: {new Date(bom.generatedAt).toLocaleDateString()} at {new Date(bom.generatedAt).toLocaleTimeString()}
          </div>
          <div>
            By: {bom.generatedBy}
          </div>
        </div>
        {bom.lastPriceUpdate && (
          <div className="mt-1">
            Last price update: {new Date(bom.lastPriceUpdate).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
}

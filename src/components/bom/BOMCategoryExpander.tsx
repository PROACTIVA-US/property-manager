import { useState } from 'react';
import { ChevronDown, ChevronRight, Package, Hammer, Zap, Droplet, Paintbrush, Boxes, Home, Shield, Trees } from 'lucide-react';
import type { BOMCategoryGroup } from '../../types/bom.types';

interface BOMCategoryExpanderProps {
  categoryGroup: BOMCategoryGroup;
}

const CATEGORY_ICONS = {
  lumber: Boxes,
  hardware: Hammer,
  electrical: Zap,
  plumbing: Droplet,
  finishing: Paintbrush,
  concrete: Shield,
  decking: Home,
  roofing: Home,
  landscaping: Trees,
  other: Package,
};

const CATEGORY_COLORS = {
  lumber: 'bg-amber-100 text-amber-700',
  hardware: 'bg-gray-100 text-gray-700',
  electrical: 'bg-yellow-100 text-yellow-700',
  plumbing: 'bg-blue-100 text-blue-700',
  finishing: 'bg-purple-100 text-purple-700',
  concrete: 'bg-stone-100 text-stone-700',
  decking: 'bg-orange-100 text-orange-700',
  roofing: 'bg-red-100 text-red-700',
  landscaping: 'bg-green-100 text-green-700',
  other: 'bg-gray-100 text-gray-700',
};

export default function BOMCategoryExpander({ categoryGroup }: BOMCategoryExpanderProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const Icon = CATEGORY_ICONS[categoryGroup.category] || Package;
  const colorClass = CATEGORY_COLORS[categoryGroup.category] || 'bg-gray-100 text-gray-700';

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Category Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${colorClass}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="text-left">
            <h4 className="font-semibold text-gray-900 capitalize">
              {categoryGroup.name}
            </h4>
            <p className="text-sm text-gray-500">
              {categoryGroup.itemCount} {categoryGroup.itemCount === 1 ? 'item' : 'items'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">
              ${categoryGroup.subtotal.toFixed(2)}
            </p>
          </div>
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Category Items */}
      {isExpanded && (
        <div className="bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-y border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Item</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-700">Qty</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-700">Unit</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-700">Unit Price</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-700">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categoryGroup.items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                        {item.notes && (
                          <p className="text-xs text-blue-600 mt-1">ℹ️ {item.notes}</p>
                        )}
                        {item.supplier && (
                          <p className="text-xs text-gray-400 mt-1 capitalize">
                            Supplier: {item.supplier.replace('_', ' ')}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600 capitalize">
                      {item.unit.replace('_', ' ')}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900">
                      ${item.unitPrice.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      ${item.totalPrice.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Alternatives Section */}
          {categoryGroup.items.some(item => item.alternatives && item.alternatives.length > 0) && (
            <div className="border-t border-gray-200 bg-blue-50 p-3">
              <p className="text-xs text-blue-700 font-medium mb-2">💡 Alternative Options Available</p>
              <div className="space-y-2">
                {categoryGroup.items
                  .filter(item => item.alternatives && item.alternatives.length > 0)
                  .map(item => (
                    <details key={item.id} className="text-xs">
                      <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                        Alternatives for {item.name}
                      </summary>
                      <ul className="mt-1 ml-4 space-y-1">
                        {item.alternatives?.map((alt, index) => (
                          <li key={index} className="text-gray-700">
                            {alt.name} - ${alt.unitPrice.toFixed(2)}
                            {alt.supplier && ` (${alt.supplier.replace('_', ' ')})`}
                            {alt.notes && ` - ${alt.notes}`}
                          </li>
                        ))}
                      </ul>
                    </details>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

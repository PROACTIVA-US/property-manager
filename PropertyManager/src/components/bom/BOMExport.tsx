import { useState } from 'react';
import { Download, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { exportBOMToCSV } from '../../lib/bom';
import type { BillOfMaterials, BOMExportOptions } from '../../types/bom.types';

interface BOMExportProps {
  bom: BillOfMaterials;
}

export default function BOMExport({ bom }: BOMExportProps) {
  const [exportOptions, setExportOptions] = useState<BOMExportOptions>({
    format: 'csv',
    includeAlternatives: true,
    includePricing: true,
    includeNotes: true,
    groupByCategory: true,
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handleExport = async () => {
    setIsExporting(true);
    setExportStatus('idle');
    setStatusMessage('');

    try {
      if (exportOptions.format === 'csv') {
        const csvData = exportBOMToCSV(bom, exportOptions);
        const filename = `BOM-${bom.projectId}-${new Date().toISOString().split('T')[0]}.csv`;

        // Create a download link
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setExportStatus('success');
        setStatusMessage(`Successfully exported ${filename}`);

        // Reset success message after 3 seconds
        setTimeout(() => {
          setExportStatus('idle');
          setStatusMessage('');
        }, 3000);
      } else {
        // PDF and Excel formats not implemented yet
        setExportStatus('error');
        setStatusMessage(`${exportOptions.format.toUpperCase()} export is not yet implemented. Use CSV for now.`);
      }
    } catch (error) {
      setExportStatus('error');
      setStatusMessage(error instanceof Error ? error.message : 'Failed to export BOM');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Download className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Export Bill of Materials</h3>
          <p className="text-sm text-gray-600">Download your BOM for printing or sharing</p>
        </div>
      </div>

      {/* Export Format */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Export Format
          </label>
          <div className="flex space-x-3">
            <button
              onClick={() => setExportOptions({ ...exportOptions, format: 'csv' })}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all ${
                exportOptions.format === 'csv'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span className="font-medium">CSV</span>
            </button>
            <button
              onClick={() => setExportOptions({ ...exportOptions, format: 'pdf' })}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all ${
                exportOptions.format === 'pdf'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
              disabled
            >
              <FileText className="h-4 w-4" />
              <span className="font-medium">PDF</span>
              <span className="text-xs">(Soon)</span>
            </button>
            <button
              onClick={() => setExportOptions({ ...exportOptions, format: 'excel' })}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all ${
                exportOptions.format === 'excel'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
              disabled
            >
              <FileText className="h-4 w-4" />
              <span className="font-medium">Excel</span>
              <span className="text-xs">(Soon)</span>
            </button>
          </div>
        </div>

        {/* Export Options */}
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Export Options</h4>
          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={exportOptions.includePricing}
                onChange={(e) => setExportOptions({ ...exportOptions, includePricing: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Include pricing information</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={exportOptions.includeNotes}
                onChange={(e) => setExportOptions({ ...exportOptions, includeNotes: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Include notes and descriptions</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={exportOptions.includeAlternatives}
                onChange={(e) => setExportOptions({ ...exportOptions, includeAlternatives: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Include alternative products</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={exportOptions.groupByCategory}
                onChange={(e) => setExportOptions({ ...exportOptions, groupByCategory: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Group items by category</span>
            </label>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {exportStatus === 'success' && (
        <div className="flex items-start space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-700">{statusMessage}</p>
        </div>
      )}

      {exportStatus === 'error' && (
        <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{statusMessage}</p>
        </div>
      )}

      {/* Export Button */}
      <button
        onClick={handleExport}
        disabled={isExporting}
        className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isExporting ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            <span>Exporting...</span>
          </>
        ) : (
          <>
            <Download className="h-5 w-5" />
            <span>Download {exportOptions.format.toUpperCase()}</span>
          </>
        )}
      </button>

      {/* Export Info */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-700">
          <strong>Tip:</strong> The exported file includes all materials with quantities, pricing,
          and can be used for purchasing or sharing with contractors.
        </p>
      </div>
    </div>
  );
}

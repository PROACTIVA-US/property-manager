import { useState } from 'react';
import { Upload, Download, AlertCircle, CheckCircle, FileText } from 'lucide-react';

interface CSVImportProps {
  onDataImported: (data: any[]) => void;
  templateColumns: string[];
  title: string;
  description: string;
}

export default function CSVImport({ onDataImported, templateColumns, title, description }: CSVImportProps) {
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState('');
  const [importSuccess, setImportSuccess] = useState(false);

  const handleDownloadTemplate = () => {
    const csvContent = templateColumns.join(',') + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(/\s+/g, '_')}_template.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] || '';
      });
      rows.push(obj);
    }

    return rows;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportMessage('');
    setImportSuccess(false);

    try {
      const text = await file.text();
      const data = parseCSV(text);

      if (data.length === 0) {
        throw new Error('No data found in CSV file');
      }

      onDataImported(data);
      setImportSuccess(true);
      setImportMessage(`✓ Successfully imported ${data.length} rows`);
      setTimeout(() => setImportMessage(''), 5000);
    } catch (error: any) {
      setImportSuccess(false);
      setImportMessage(`✗ Import failed: ${error.message}`);
      setTimeout(() => setImportMessage(''), 5000);
    } finally {
      setImporting(false);
      // Reset the input
      event.target.value = '';
    }
  };

  return (
    <div className="card bg-brand-navy/30 border-l-4 border-brand-orange">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-brand-orange/20 rounded-lg text-brand-orange">
          <FileText size={20} />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-brand-light mb-1">{title}</h4>
          <p className="text-sm text-brand-muted mb-4">{description}</p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleDownloadTemplate}
              className="btn-secondary text-sm flex items-center gap-2"
            >
              <Download size={16} />
              Download Template
            </button>

            <label className="btn-primary text-sm flex items-center gap-2 cursor-pointer">
              <Upload size={16} />
              {importing ? 'Importing...' : 'Import CSV'}
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                disabled={importing}
              />
            </label>
          </div>

          {importMessage && (
            <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 text-sm ${
              importSuccess
                ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                : 'bg-red-500/10 border border-red-500/30 text-red-400'
            }`}>
              {importSuccess ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              {importMessage}
            </div>
          )}

          <div className="mt-4 text-xs text-brand-muted">
            <p className="font-medium mb-1">Expected columns:</p>
            <p className="font-mono bg-black/30 p-2 rounded">{templateColumns.join(', ')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

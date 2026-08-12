// src/app/admin/import/page.tsx
// Safa Kurtilab Visual Admin Import Control Center
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, FileText, CheckCircle, Sparkles, Database, Layers } from 'lucide-react';
import { normalizeVendorRow } from '@/lib/ai-schema-normalizer';
import { sanitizeAndValidateRecord, SanitizedRecord } from '@/lib/data-sanitizer';

export default function AdminImportPage() {
  const [rawInput, setRawInput] = useState('');
  const [vendorName, setVendorName] = useState('Jaipur_Vendor');
  const [previewRecords, setPreviewRecords] = useState<SanitizedRecord[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Parse raw JSON or CSV text into preview records
  const handlePreviewParse = () => {
    try {
      let parsedRows: Record<string, unknown>[] = [];
      const trimmed = rawInput.trim();

      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        const json = JSON.parse(trimmed);
        parsedRows = Array.isArray(json) ? json : [json];
      } else {
        // Simple CSV parser
        const lines = trimmed.split(/\r?\n/).filter(l => l.trim().length > 0);
        if (lines.length > 1) {
          const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
          for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
            const obj: Record<string, string> = {};
            headers.forEach((h, idx) => {
              obj[h] = cols[idx] || '';
            });
            parsedRows.push(obj);
          }
        }
      }

      const sanitized = parsedRows.map((row, idx) => {
        const normalized = normalizeVendorRow(row, vendorName);
        return sanitizeAndValidateRecord(normalized, idx);
      });

      setPreviewRecords(sanitized);
      setImportStatus(`Parsed ${sanitized.length} preview records successfully. Click "Approve & Import" to sync.`);
    } catch {
      setImportStatus('❌ Error parsing input format. Ensure valid CSV or JSON text.');
    }
  };

  // Submit parsed records to production API
  const handleExecuteImport = async () => {
    if (previewRecords.length === 0) return;
    setIsProcessing(true);
    setImportStatus('⚡ Executing database sync...');

    try {
      const res = await fetch('/api/admin/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: previewRecords, defaultVendor: vendorName }),
      });
      const data = await res.json();

      if (res.ok && data.status === 'success') {
        setImportStatus(`🎉 Success! ${data.message}`);
        setPreviewRecords([]);
        setRawInput('');
      } else {
        setImportStatus(`❌ Import Error: ${data.message}`);
      }
    } catch {
      setImportStatus('❌ Network error while executing import.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gold-primary/10 pb-6 gap-4">
        <div>
          <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs text-charcoal/60 hover:text-emerald-primary uppercase tracking-wider font-semibold transition-colors mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Command Center
          </Link>
          <h1 className="font-serif text-3xl font-bold text-charcoal flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-gold-dark" /> AI Vendor Catalog Ingestion Center
          </h1>
        </div>
      </div>

      {/* Input Form & Options */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 space-y-4 bg-white p-6 border border-gold-primary/20 rounded-xl shadow-sm">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-sm font-bold text-charcoal uppercase tracking-wider flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-emerald-primary" /> Vendor Raw Data Input
            </h3>
            <span className="text-[10px] text-charcoal/50 uppercase font-bold">CSV / JSON / Text Dump</span>
          </div>

          <div>
            <label className="text-xs font-bold text-charcoal/70 uppercase tracking-wider block mb-1">
              Select Wholesaler Manufacturing Hub
            </label>
            <select
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              className="w-full p-2.5 border border-gold-primary/20 rounded text-xs text-charcoal bg-white font-semibold focus:outline-none focus:border-gold-primary"
            >
              <option value="Jaipur_Vendor">🏰 Jaipur Hub (Cotton & Block Print)</option>
              <option value="Surat_Vendor">🏭 Surat Hub (Rayon & Georgette)</option>
              <option value="Lucknow_Vendor">👑 Lucknow Hub (Chikankari & Modal)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-charcoal/70 uppercase tracking-wider block mb-1">
              Paste Raw Supplier CSV / JSON / WhatsApp Payload
            </label>
            <textarea
              rows={10}
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder='Paste raw CSV or JSON text here. e.g. [{"title": "Cambric Set", "rate": 695, "fabric": "Cotton"}]'
              className="w-full p-3 border border-gold-primary/20 rounded text-xs font-mono text-charcoal bg-alabaster/40 focus:outline-none focus:border-gold-primary"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handlePreviewParse}
              disabled={!rawInput.trim()}
              className="flex-1 py-3 bg-gold-dark hover:bg-gold-primary text-white text-xs font-bold uppercase tracking-wider rounded transition-colors shadow flex items-center justify-center gap-1.5"
            >
              <FileText className="w-4 h-4" /> AI Auto-Map Columns
            </button>
          </div>
        </div>

        {/* Live Preview Panel */}
        <div className="lg:col-span-6 space-y-4 bg-white p-6 border border-gold-primary/20 rounded-xl shadow-sm">
          <div className="flex justify-between items-center border-b border-gold-primary/10 pb-3">
            <h3 className="font-serif text-sm font-bold text-emerald-primary uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-4 h-4" /> Live Schema Mapping Preview ({previewRecords.length})
            </h3>
            {previewRecords.length > 0 && (
              <button
                onClick={handleExecuteImport}
                disabled={isProcessing}
                className="px-4 py-2 bg-emerald-primary hover:bg-emerald-light text-white text-xs font-bold uppercase tracking-wider rounded transition-colors shadow flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" /> Approve & Sync DB
              </button>
            )}
          </div>

          {importStatus && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs font-semibold text-emerald-dark">
              {importStatus}
            </div>
          )}

          {previewRecords.length === 0 ? (
            <div className="py-16 text-center text-charcoal/40 text-xs space-y-2">
              <Layers className="w-10 h-10 mx-auto opacity-30" />
              <p>No preview data generated yet. Paste raw supplier text on the left and click &quot;AI Auto-Map Columns&quot;.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {previewRecords.map((rec, i) => (
                <div key={i} className="p-3 border border-gold-primary/15 rounded bg-alabaster/30 text-xs space-y-1.5">
                  <div className="flex justify-between font-bold text-charcoal">
                    <span>{rec.title}</span>
                    <span className="text-emerald-primary">₹{rec.listingPrice}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-[10px] text-charcoal/70">
                    <span className="bg-white px-2 py-0.5 rounded border">Fab: {rec.fabric}</span>
                    <span className="bg-white px-2 py-0.5 rounded border">Cat: {rec.category}</span>
                    <span className="bg-white px-2 py-0.5 rounded border">Hub: {rec.hubLocation}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

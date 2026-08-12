// src/lib/pdf-invoice.ts
// Printable B2B Proforma Invoice & Quotation Generator for Safa Kurtilab

export interface InvoiceData {
  orderId: string;
  date: string;
  customerName: string;
  companyName?: string;
  gstin?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  items: Array<{
    title: string;
    setRatio?: string;
    quantity: number; // Sets
    setPrice: number;
    totalAmount: number;
  }>;
  subtotal: number;
  discountAmount: number;
  gstAmount: number;
  grandTotal: number;
}

export function generateGSTInvoiceHTML(data: InvoiceData): string {
  const isRajasthanIntraState = data.state.toLowerCase().includes('rajasthan');
  const cgst = isRajasthanIntraState ? data.gstAmount / 2 : 0;
  const sgst = isRajasthanIntraState ? data.gstAmount / 2 : 0;
  const igst = !isRajasthanIntraState ? data.gstAmount : 0;

  const itemsRows = data.items
    .map(
      (item, idx) => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 10px; text-align: center;">${idx + 1}</td>
        <td style="padding: 10px;">
          <strong>${item.title}</strong><br/>
          <span style="font-size: 11px; color: #6b7280;">Set Ratio: ${item.setRatio || 'Standard (M,L,XL,XXL)'}</span>
        </td>
        <td style="padding: 10px; text-align: center;">6204.22.00</td>
        <td style="padding: 10px; text-align: center;">${item.quantity} Sets (4 Pcs/Set)</td>
        <td style="padding: 10px; text-align: right;">₹${item.setPrice.toLocaleString('en-IN')}</td>
        <td style="padding: 10px; text-align: right; font-weight: bold;">₹${item.totalAmount.toLocaleString('en-IN')}</td>
      </tr>
    `
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>B2B Proforma Invoice #${data.orderId}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1f2937; margin: 0; padding: 25px; background: #fff; }
    .invoice-card { max-width: 800px; margin: 0 auto; border: 1px solid #d1d5db; padding: 30px; border-radius: 8px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #047857; padding-bottom: 20px; }
    .brand-title { font-size: 26px; font-weight: bold; color: #047857; letter-spacing: 1px; }
    .brand-sub { font-size: 12px; color: #b45309; text-transform: uppercase; font-weight: bold; }
    .badge { background: #ecfdf5; color: #047857; font-size: 11px; font-weight: bold; padding: 4px 8px; border-radius: 4px; border: 1px solid #a7f3d0; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; font-size: 13px; }
    .box { background: #f9fafb; border: 1px solid #e5e7eb; padding: 15px; border-radius: 6px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }
    th { background: #047857; color: white; padding: 10px; text-align: left; font-size: 12px; text-transform: uppercase; }
    .totals { width: 320px; margin-left: auto; font-size: 13px; }
    .totals div { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f3f4f6; }
    .grand-total { font-size: 16px; font-weight: bold; color: #047857; border-top: 2px solid #047857 !important; border-bottom: none !important; padding-top: 10px !important; }
    .bank-box { background: #fffbebf5; border: 1px solid #fef3c7; padding: 15px; border-radius: 6px; font-size: 12px; margin-top: 20px; }
    .print-btn { background: #047857; color: white; border: none; padding: 10px 20px; font-weight: bold; border-radius: 5px; cursor: pointer; margin-bottom: 20px; }
    @media print { .print-btn { display: none; } }
  </style>
</head>
<body>
  <div style="text-align: right;">
    <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF Invoice</button>
  </div>

  <div class="invoice-card">
    <div class="header">
      <div>
        <div class="brand-title">SAFA KURTI LAB</div>
        <div class="brand-sub">Luxury Apparel Wholesale Hub • Rajasthan</div>
        <div style="font-size: 11px; color: #4b5563; margin-top: 5px;">
          Sanganer Industrial Cluster, Jaipur - 302029<br/>
          GSTIN: 08AAAFS9912K1Z4 | Contact: +91 98290 12345
        </div>
      </div>
      <div style="text-align: right;">
        <span class="badge">B2B TAX PROFORMA INVOICE</span>
        <h3 style="margin: 8px 0 4px 0; font-size: 16px;">#${data.orderId}</h3>
        <div style="font-size: 12px; color: #6b7280;">Date: ${data.date}</div>
      </div>
    </div>

    <div class="grid-2">
      <div class="box">
        <strong style="color: #047857; text-transform: uppercase; font-size: 11px; display: block; margin-bottom: 5px;">Billed To (Buyer Profile)</strong>
        <strong>${data.companyName || data.customerName}</strong><br/>
        ${data.gstin ? `<strong>GSTIN:</strong> ${data.gstin}<br/>` : ''}
        Address: ${data.address}, ${data.city}<br/>
        State: ${data.state} - ${data.pincode}<br/>
        Phone: ${data.phone}
      </div>
      <div class="box">
        <strong style="color: #047857; text-transform: uppercase; font-size: 11px; display: block; margin-bottom: 5px;">Dispatch & Fulfillment Logistics</strong>
        Dispatch Location: <strong>Jaipur Central Warehouse</strong><br/>
        Shipping Mode: 3PL Express Surface Freight<br/>
        Packaging: 100% Blind Brand Protection Boxes<br/>
        Status: <span style="color: #059669; font-weight: bold;">Prepaid B2B Order</span>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 40px;">#</th>
          <th>Apparel Description</th>
          <th style="text-align: center;">HSN Code</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Wholesale Rate</th>
          <th style="text-align: right;">Amount (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    <div class="totals">
      <div><span>Subtotal (Before Tax & Dis.):</span> <span>₹${(data.subtotal + data.discountAmount).toLocaleString('en-IN')}</span></div>
      ${data.discountAmount > 0 ? `<div style="color: #059669;"><span>B2B Volume Tier Discount:</span> <span>-₹${data.discountAmount.toLocaleString('en-IN')}</span></div>` : ''}
      <div><span>Taxable Base Value:</span> <span>₹${data.subtotal.toLocaleString('en-IN')}</span></div>
      ${isRajasthanIntraState ? `
        <div><span>CGST @ 2.5%:</span> <span>₹${cgst.toLocaleString('en-IN')}</span></div>
        <div><span>SGST @ 2.5%:</span> <span>₹${sgst.toLocaleString('en-IN')}</span></div>
      ` : `
        <div><span>IGST @ 5.0%:</span> <span>₹${igst.toLocaleString('en-IN')}</span></div>
      `}
      <div class="grand-total"><span>Grand Total (Net Payable):</span> <span>₹${data.grandTotal.toLocaleString('en-IN')}</span></div>
    </div>

    <div class="bank-box">
      <strong style="color: #92400e; text-transform: uppercase; font-size: 11px; block; margin-bottom: 5px;">🏦 Bank Wire Transfer (NEFT / RTGS / IMPS Details)</strong>
      Bank Name: <strong>HDFC Bank Ltd (Jaipur Main Branch)</strong><br/>
      Account Name: <strong>Safa Kurti Lab Private Limited</strong><br/>
      Account No: <strong>50200084920194</strong> | IFSC Code: <strong>HDFC0000240</strong>
    </div>

    <div style="margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 15px; font-size: 11px; color: #9ca3af; text-align: center;">
      This is a computer-generated B2B Proforma Invoice issued under Rule 46 of CGST Rules 2017.
    </div>
  </div>
</body>
</html>
  `;
}

export function openPrintableInvoice(data: InvoiceData) {
  const html = generateGSTInvoiceHTML(data);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
}

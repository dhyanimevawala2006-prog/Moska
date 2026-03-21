import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';

// ── Static store details ─────────────────────────────────────
const STORE = {
  name:    'MOSKA Fashion',
  address: '12, Textile Market, Ring Road',
  city:    'Surat',
  state:   'Gujarat',
  pincode: '395002',
  gstin:   '24XXXXX0000X1ZX',
  pan:     'XXXXX0000X',
  email:   'support@moska.in',
  phone:   '+91 98765 43210',
};

// ── Brand palette (matches website) ─────────────────────────
const C = {
  darkBrown:  '#3A2E26',
  brown:      '#9B7B5E',
  gold:       '#C5A059',
  cream:      '#FDF6EC',
  beige:      '#EDE6DC',
  lightBeige: '#F9F6F2',
  white:      '#FFFFFF',
  text:       '#3A2E26',
  muted:      '#7A6A5C',
  green:      '#5FA55A',
  border:     '#D4C4B0',
};

@Injectable({ providedIn: 'root' })
export class InvoiceService {

  openInvoice(order: any, index: number = 0): void {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pw  = 210;
    const ph  = 297;
    const m   = 12;
    const cw  = pw - m * 2;
    let   y   = 0;

    const invoiceNo   = `MOSKA-${new Date(order.createdAt).getFullYear()}-${String(index + 1).padStart(5, '0')}`;
    const orderDate   = new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const invoiceDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const addr        = order.address || {};
    const items: any[]= order.items || [];
    const subtotal    = order.total || 0;
    const discount    = order.discount || 0;
    const grandTotal  = order.finalTotal || subtotal;
    const delivery    = grandTotal - subtotal + discount;

    const rgb  = (h: string): [number,number,number] => [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
    const fill = (c: string) => doc.setFillColor(...rgb(c));
    const draw = (c: string) => doc.setDrawColor(...rgb(c));
    const tc   = (c: string) => doc.setTextColor(...rgb(c));
    const ln   = (x1:number,y1:number,x2:number,y2:number,w=0.25) => { doc.setLineWidth(w); doc.line(x1,y1,x2,y2); };
    const B    = (s=8)  => { doc.setFont('helvetica','bold');   doc.setFontSize(s); };
    const N    = (s=8)  => { doc.setFont('helvetica','normal'); doc.setFontSize(s); };

    // ── HEADER BAND ─────────────────────────────────────────
    fill(C.darkBrown);
    doc.rect(0, 0, pw, 32, 'F');
    fill(C.gold);
    doc.rect(0, 30, pw, 2, 'F');

    doc.setFont('times', 'bold');
    doc.setFontSize(26);
    tc(C.white);
    doc.text('MOSKA', m, 20);

    N(7); tc(C.gold);
    doc.text('FASHION  &  LIFESTYLE', m, 26);

    B(14); tc(C.gold);
    doc.text('Tax Invoice', pw - m, 16, { align: 'right' });

    N(7.5); tc('#DDDDDD');
    doc.text(`Invoice No: ${invoiceNo}`, pw - m, 22, { align: 'right' });
    doc.text(`Date: ${invoiceDate}`, pw - m, 27, { align: 'right' });

    y = 36;

    // ── META ROW ────────────────────────────────────────────
    fill(C.cream);
    doc.rect(m, y, cw, 18, 'F');
    draw(C.border);
    doc.setLineWidth(0.3);
    doc.rect(m, y, cw, 18);

    const metaItems = [
      { label: 'Order ID',     value: order._id?.slice(-10).toUpperCase() || 'N/A' },
      { label: 'Order Date',   value: orderDate },
      { label: 'Invoice Date', value: invoiceDate },
      { label: 'Payment',      value: order.paymentMethod === 'online' ? 'Online (Razorpay)' : 'Cash on Delivery' },
    ];
    const mw = cw / metaItems.length;
    metaItems.forEach((item, i) => {
      const mx = m + i * mw + 3;
      B(6.5); tc(C.brown);
      doc.text(item.label.toUpperCase(), mx, y + 6);
      B(8); tc(C.darkBrown);
      doc.text(item.value, mx, y + 13);
      if (i > 0) { draw(C.border); ln(m + i * mw, y + 2, m + i * mw, y + 16, 0.2); }
    });

    y += 22;

    // ── ADDRESS SECTION ─────────────────────────────────────
    const col3 = cw / 3;
    const addrHeaders = ['Billed To', 'Shipped To', 'Shipped From'];
    addrHeaders.forEach((h, i) => {
      const ax = m + i * col3;
      fill(C.beige);
      doc.rect(ax, y, col3, 6, 'F');
      fill(C.gold);
      doc.rect(ax, y, 2, 6, 'F');
      B(7); tc(C.darkBrown);
      doc.text(h, ax + 5, y + 4.2);
    });
    y += 6;

    const billLines = [addr.name||'Customer', addr.address||'', `${addr.city||''}, ${addr.state||''}`, addr.pincode ? `PIN: ${addr.pincode}` : ''].filter(Boolean);
    const fromLines = [STORE.name, STORE.address, `${STORE.city} - ${STORE.pincode}`, STORE.state];
    const addrCols  = [billLines, billLines, fromLines];
    const addrH     = Math.max(...addrCols.map(a => a.length)) * 4.5 + 4;

    addrCols.forEach((lines, i) => {
      const ax = m + i * col3;
      fill(i % 2 === 0 ? C.lightBeige : C.white);
      doc.rect(ax, y, col3, addrH, 'F');
      lines.forEach((line, li) => {
        if (li === 0) { B(8); tc(C.darkBrown); } else { N(7.5); tc(C.muted); }
        doc.text(line, ax + 5, y + 5 + li * 4.5);
      });
      draw(C.border); ln(ax, y, ax, y + addrH, 0.2);
    });
    draw(C.border);
    doc.setLineWidth(0.3);
    doc.rect(m, y, cw, addrH);

    y += addrH + 4;

    if (order.couponCode) {
      fill(C.cream);
      doc.rect(m, y, cw, 7, 'F');
      draw(C.green);
      doc.setLineWidth(0.4);
      doc.rect(m, y, cw, 7);
      B(7); tc(C.green);
      doc.text(`Coupon Applied: ${order.couponCode}  —  Saving Rs.${discount.toLocaleString('en-IN')}`, m + 4, y + 4.5);
      y += 11;
    }

    // ── ITEMS TABLE ─────────────────────────────────────────
    const tH   = 8;
    const cols = {
      sno:  { x: m,      w: 9  },
      desc: { x: m + 9,  w: 91 },
      qty:  { x: m + 100,w: 20 },
      unit: { x: m + 120,w: 32 },
      amt:  { x: m + 152,w: pw - m - (m + 152) },
    };

    fill(C.darkBrown);
    doc.rect(m, y, cw, tH, 'F');
    fill(C.gold);
    doc.rect(m, y + tH - 1, cw, 1, 'F');

    B(7.5); tc(C.white);
    const th: [keyof typeof cols, string, 'left'|'center'][] = [
      ['sno',  '#',          'center'],
      ['desc', 'Product',    'left'  ],
      ['qty',  'Qty',        'center'],
      ['unit', 'Unit Price', 'center'],
      ['amt',  'Amount',     'center'],
    ];
    th.forEach(([k, label, align]) => {
      const c  = cols[k];
      const cx = align === 'left' ? c.x + 3 : c.x + c.w / 2;
      doc.text(label, cx, y + 5.2, { align });
    });
    draw('#5A4A3A');
    Object.values(cols).slice(1).forEach(c => { ln(c.x, y, c.x, y + tH, 0.2); });
    ln(pw - m, y, pw - m, y + tH, 0.2);
    y += tH;

    items.forEach((item: any, idx: number) => {
      const name    = item.productId?.pname || item.pname || 'Product';
      const price   = Number(item.productId?.price ?? item.price ?? 0);
      const qty     = item.quantity || 1;
      const amount  = price * qty;
      const variant = [item.color, item.size].filter(Boolean).join('  ·  ');
      const rowH    = variant ? 11 : 8;

      fill(idx % 2 === 0 ? C.lightBeige : C.white);
      doc.rect(m, y, cw, rowH, 'F');

      N(7.5); tc(C.muted);
      doc.text(String(idx + 1), cols.sno.x + cols.sno.w / 2, y + 5, { align: 'center' });

      B(8); tc(C.darkBrown);
      doc.text(doc.splitTextToSize(name, cols.desc.w - 5)[0], cols.desc.x + 3, y + 5);
      if (variant) { N(6.5); tc(C.brown); doc.text(variant, cols.desc.x + 3, y + 9); }

      N(8); tc(C.text);
      doc.text(String(qty), cols.qty.x + cols.qty.w / 2, y + 5, { align: 'center' });
      doc.text(`Rs.${price.toLocaleString('en-IN')}`, cols.unit.x + cols.unit.w / 2, y + 5, { align: 'center' });

      B(8); tc(C.darkBrown);
      doc.text(`Rs.${amount.toLocaleString('en-IN')}`, cols.amt.x + cols.amt.w / 2, y + 5, { align: 'center' });

      draw(C.border);
      ln(m, y + rowH, pw - m, y + rowH, 0.2);
      Object.values(cols).slice(1).forEach(c => { ln(c.x, y, c.x, y + rowH, 0.2); });
      ln(pw - m, y, pw - m, y + rowH, 0.2);
      ln(m, y, m, y + rowH, 0.2);
      y += rowH;
    });

    // ── delivery charges row inside table ───────────────────
    if (delivery > 0) {
      fill(C.white);
      doc.rect(m, y, cw, 8, 'F');
      N(7.5); tc(C.muted);
      doc.text('—', cols.sno.x + cols.sno.w / 2, y + 5, { align: 'center' });
      N(8); tc(C.text);
      doc.text('Delivery Charges', cols.desc.x + 3, y + 5);
      doc.text('1', cols.qty.x + cols.qty.w / 2, y + 5, { align: 'center' });
      doc.text(`Rs.${delivery.toLocaleString('en-IN')}`, cols.unit.x + cols.unit.w / 2, y + 5, { align: 'center' });
      B(8); tc(C.darkBrown);
      doc.text(`Rs.${delivery.toLocaleString('en-IN')}`, cols.amt.x + cols.amt.w / 2, y + 5, { align: 'center' });
      draw(C.border);
      ln(m, y + 8, pw - m, y + 8, 0.2);
      Object.values(cols).slice(1).forEach(c => { ln(c.x, y, c.x, y + 8, 0.2); });
      ln(pw - m, y, pw - m, y + 8, 0.2);
      ln(m, y, m, y + 8, 0.2);
      y += 8;
    }

    // ── coupon discount row inside table ────────────────────
    if (discount > 0) {
      fill(C.white);
      doc.rect(m, y, cw, 8, 'F');
      N(7.5); tc(C.muted);
      doc.text('—', cols.sno.x + cols.sno.w / 2, y + 5, { align: 'center' });
      N(8); tc(C.green);
      doc.text(`Coupon Discount (${order.couponCode || ''})`, cols.desc.x + 3, y + 5);
      B(8); tc(C.green);
      doc.text(`-Rs.${discount.toLocaleString('en-IN')}`, cols.amt.x + cols.amt.w / 2, y + 5, { align: 'center' });
      draw(C.border);
      ln(m, y + 8, pw - m, y + 8, 0.2);
      Object.values(cols).slice(1).forEach(c => { ln(c.x, y, c.x, y + 8, 0.2); });
      ln(pw - m, y, pw - m, y + 8, 0.2);
      ln(m, y, m, y + 8, 0.2);
      y += 8;
    }

    // ── totals row ───────────────────────────────────────────
    const totalQty = items.reduce((s: number, i: any) => s + (i.quantity || 1), 0);
    fill(C.beige);
    doc.rect(m, y, cw, 8, 'F');
    B(8); tc(C.darkBrown);
    doc.text('Total', cols.desc.x + 3, y + 5.2);
    doc.text(String(totalQty), cols.qty.x + cols.qty.w / 2, y + 5.2, { align: 'center' });
    doc.text(`Rs.${grandTotal.toLocaleString('en-IN')}`, cols.amt.x + cols.amt.w / 2, y + 5.2, { align: 'center' });
    draw(C.brown);
    doc.setLineWidth(0.4);
    ln(m, y, pw - m, y, 0.4);
    ln(m, y + 8, pw - m, y + 8, 0.4);
    y += 8;

    // ── GRAND TOTAL BLOCK ────────────────────────────────────
    y += 5;

    const gtX = pw - m - 62;
    fill(C.darkBrown);
    doc.rect(gtX, y - 3, 62, 14, 'F');
    fill(C.gold);
    doc.rect(gtX, y + 11, 62, 1.5, 'F');
    B(8); tc(C.gold);
    doc.text('Grand Total', gtX + 4, y + 4);
    B(13); tc(C.white);
    doc.text(`Rs.${grandTotal.toLocaleString('en-IN')}`, pw - m - 3, y + 10, { align: 'right' });

    // ── FOOTER BAND ──────────────────────────────────────────
    const footerY = ph - 22;
    fill(C.gold);
    doc.rect(0, footerY, pw, 1.5, 'F');
    fill(C.darkBrown);
    doc.rect(0, footerY + 1.5, pw, 20.5, 'F');

    B(8); tc(C.gold);
    doc.text('Thank you for shopping with MOSKA!', pw / 2, footerY + 8, { align: 'center' });
    N(6.5); tc('#BBBBBB');
    doc.text(`${STORE.address}, ${STORE.city} - ${STORE.pincode}  |  ${STORE.phone}  |  ${STORE.email}`, pw / 2, footerY + 13, { align: 'center' });
    doc.text('This is a computer-generated invoice and does not require a physical signature.', pw / 2, footerY + 18, { align: 'center' });

    const blobUrl = doc.output('bloburl');
    window.open(blobUrl as unknown as string, '_blank');
  }
}

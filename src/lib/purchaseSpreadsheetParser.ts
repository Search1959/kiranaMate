/**
 * Local (no-AI) parser for purchase-bill Excel/CSV files. A spreadsheet, unlike a
 * photographed bill, is already machine-readable text — most real supplier
 * spreadsheets have a normal header row and don't need Gemini's OCR/translation at
 * all. Parsing it locally is instant, free, and can't hit an AI quota limit or a
 * server-timeout on a large sheet (a 500-line real bill sent to Gemini can take
 * 30+ seconds, which is long enough to trip a hosting provider's request timeout —
 * this sidesteps that entirely for any spreadsheet with a recognisable layout).
 *
 * ScanPurchaseBillModal tries this first for .xlsx/.xls/.csv uploads and only
 * falls back to the AI scan when no confident header row is found (an unusual
 * layout, or a photo/PDF, which this never handles).
 */

const norm = (v: unknown) => String(v ?? '').trim().toLowerCase();
const toNumber = (v: unknown): number => {
  const cleaned = String(v ?? '').replace(/,/g, '').trim();
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
};

interface ColumnMap {
  name: number;
  spec?: number;
  unit?: number;
  quantity: number;
  rate: number;
  lineTotal?: number;
  cgstPercent?: number;
  sgstPercent?: number;
  gstPercent?: number;
  hsn?: number;
  batch?: number;
  expiry?: number;
  discountPercent?: number;
  freeQty?: number;
  // Some bills print the rate IN the header ("CGST 9%") with the column body holding
  // the computed rupee amount for that line, not a percentage — these hold that fixed
  // rate so it isn't mistaken for a per-row percentage value.
  cgstFixedPercent?: number;
  sgstFixedPercent?: number;
  gstFixedPercent?: number;
}

// Aliases are matched by substring (a header like "CGST 9%" or "Size / Specification"
// still matches "cgst" / "size"), same tolerant approach as the Bulk Product Import.
const ALIASES: Record<string, string[]> = {
  name: ['item name', 'item description', 'description', 'product name', 'item'],
  spec: ['size / specification', 'specification', 'material / grade', 'size', 'standard', 'grade'],
  unit: ['uom', 'unit'],
  quantity: ['quantity', 'qty'],
  rate: ['rate', 'unit rate', 'purchase price', 'price'],
  lineTotal: ['line total', 'total amount', 'amount', 'total'],
  cgstPercent: ['cgst'],
  sgstPercent: ['sgst'],
  gstPercent: ['igst', 'gst %', 'gst%', 'tax %'],
  hsn: ['hsn'],
  batch: ['batch', 'lot no', 'lot'],
  expiry: ['exp dt', 'expiry', 'exp date'],
  discountPercent: ['dis%', 'discount%', 'disc%', 'discount %'],
  freeQty: ['free qty', 'free']
};

/** Finds the first row (within the first 20) that looks like a real header row —
 * matches at least 2 different fields, and always both `name` and `quantity`
 * (a title/metadata row never has both). Returns the row index and column map, or
 * null if nothing in this sheet looks like a header row. */
function findHeaderRow(rows: unknown[][]): { rowIndex: number; map: ColumnMap } | null {
  const limit = Math.min(rows.length, 20);
  for (let r = 0; r < limit; r++) {
    const rawCells = (rows[r] || []).map(c => String(c ?? ''));
    const cells = rawCells.map(norm);
    if (cells.every(c => !c)) continue;

    const map: Partial<ColumnMap> = {};
    let matchedFields = 0;
    const usedIndices = new Set<number>();
    (Object.keys(ALIASES) as (keyof ColumnMap)[]).forEach(field => {
      // Aliases are tried in priority order (most specific first) rather than
      // "any cell matching any alias" — otherwise a generic alias like "amount"
      // (for lineTotal) matches "Taxable Amount" before "Line Total" is even
      // considered, just because it appears earlier in the row. A column already
      // claimed by an earlier field is skipped — e.g. "Item Description &
      // Specification" would otherwise satisfy both `name` and `spec`, and
      // "CGST%" would satisfy both `cgstPercent` and the generic `gstPercent`.
      let idx = -1;
      for (const alias of ALIASES[field]) {
        idx = cells.findIndex((c, i) => !usedIndices.has(i) && c.includes(alias));
        if (idx !== -1) break;
      }
      if (idx !== -1) {
        (map as any)[field] = idx;
        usedIndices.add(idx);
        matchedFields++;
      }
    });

    // "CGST 9%" as the header itself means the column body is a rupee AMOUNT for
    // that fixed 9%, not a per-row percentage — pull the rate from the header text.
    const headerRate = (idx?: number) => {
      if (idx === undefined) return undefined;
      const m = rawCells[idx].match(/(\d+(?:\.\d+)?)\s*%/);
      return m ? Number(m[1]) : undefined;
    };
    if (map.cgstPercent !== undefined) map.cgstFixedPercent = headerRate(map.cgstPercent);
    if (map.sgstPercent !== undefined) map.sgstFixedPercent = headerRate(map.sgstPercent);
    if (map.gstPercent !== undefined) map.gstFixedPercent = headerRate(map.gstPercent);

    if (map.name !== undefined && map.quantity !== undefined && map.rate !== undefined && matchedFields >= 3) {
      return { rowIndex: r, map: map as ColumnMap };
    }
  }
  return null;
}

/** Scans every row's first two cells for "Label: Value" style metadata (Supplier
 * Name, GSTIN, Invoice No, Invoice Date) — the same free-text layout Gemini was
 * asked to read, just matched directly instead of via AI. */
function extractMetadata(rows: unknown[][], headerRowIndex: number) {
  const meta: Record<string, string> = {};
  const patterns: { key: string; aliases: string[] }[] = [
    { key: 'supplierName', aliases: ['supplier name', 'supplier', 'vendor'] },
    { key: 'supplierGstin', aliases: ['gstin', 'gst no'] },
    { key: 'invoiceNumber', aliases: ['invoice no', 'invoice number', 'bill no'] },
    { key: 'invoiceDate', aliases: ['invoice date', 'bill date', 'date'] }
  ];
  for (let r = 0; r < headerRowIndex; r++) {
    const row = rows[r] || [];
    for (let c = 0; c < row.length - 1; c++) {
      const label = norm(row[c]);
      if (!label) continue;
      const value = String(row[c + 1] ?? '').trim();
      if (!value) continue;
      for (const p of patterns) {
        if (!meta[p.key] && p.aliases.some(a => label.includes(a))) {
          meta[p.key] = value;
        }
      }
    }
  }
  return meta;
}

export interface ParsedPurchaseBill {
  supplierName: string;
  supplierMobile?: string;
  supplierGstin?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  detectedLanguage: string;
  totalAmount: number;
  items: {
    name: string;
    productName: string;
    category: string;
    unit: string;
    quantity: number;
    purchasePrice: number;
    totalPrice: number;
    hsn?: string;
    batchNumber?: string;
    expiryDate?: string;
    discountPercent?: number;
    gstPercent?: number;
    freeQty?: number;
  }[];
}

/** Returns the parsed bill, or null if this sheet (in any tab of the workbook)
 * doesn't have a recognisable item table — the caller should fall back to AI. */
export async function parsePurchaseSpreadsheetLocally(file: File): Promise<ParsedPurchaseBill | null> {
  const XLSX = await import('xlsx');
  const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });

  for (const sheetName of workbook.SheetNames) {
    const rows: unknown[][] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, blankrows: false, defval: '' });
    const found = findHeaderRow(rows);
    if (!found) continue;

    const { rowIndex, map } = found;
    const meta = extractMetadata(rows, rowIndex);

    const items: ParsedPurchaseBill['items'] = [];
    for (let r = rowIndex + 1; r < rows.length; r++) {
      const row = rows[r] || [];
      const rawName = String(row[map.name] ?? '').trim();
      if (!rawName) continue;
      const spec = map.spec !== undefined ? String(row[map.spec] ?? '').trim() : '';
      const quantity = toNumber(row[map.quantity]);
      const rate = toNumber(row[map.rate]);
      if (quantity <= 0 && rate <= 0) continue; // a stray subtotal/notes row, not an item

      // A fixed rate baked into the header ("CGST 9%") wins — the cell underneath it
      // is that line's rupee tax amount, not a percentage, so it's never read as one.
      const cgst = map.cgstFixedPercent ?? (map.cgstPercent !== undefined ? toNumber(row[map.cgstPercent]) : undefined);
      const sgst = map.sgstFixedPercent ?? (map.sgstPercent !== undefined ? toNumber(row[map.sgstPercent]) : undefined);
      const singleGst = map.gstFixedPercent ?? (map.gstPercent !== undefined ? toNumber(row[map.gstPercent]) : undefined);
      const gstPercent = singleGst || (cgst !== undefined || sgst !== undefined ? (cgst || 0) + (sgst || 0) : undefined);

      items.push({
        name: spec ? `${rawName} - ${spec}` : rawName,
        productName: spec ? `${rawName} - ${spec}` : rawName,
        category: 'Other',
        unit: map.unit !== undefined ? (String(row[map.unit] ?? '').trim() || 'pcs') : 'pcs',
        quantity,
        purchasePrice: rate,
        // A Total/Line Total column that's blank for this row (unfilled template
        // cell, not an actual zero) falls back to quantity × rate.
        totalPrice: (map.lineTotal !== undefined && toNumber(row[map.lineTotal]) > 0)
          ? toNumber(row[map.lineTotal])
          : Math.round(quantity * rate * 100) / 100,
        hsn: map.hsn !== undefined ? String(row[map.hsn] ?? '').trim() || undefined : undefined,
        batchNumber: map.batch !== undefined ? String(row[map.batch] ?? '').trim() || undefined : undefined,
        expiryDate: map.expiry !== undefined ? String(row[map.expiry] ?? '').trim() || undefined : undefined,
        discountPercent: map.discountPercent !== undefined ? toNumber(row[map.discountPercent]) || undefined : undefined,
        gstPercent,
        freeQty: map.freeQty !== undefined ? toNumber(row[map.freeQty]) || undefined : undefined
      });
    }

    if (items.length === 0) continue;

    return {
      supplierName: meta.supplierName || 'Wholesale Supplier',
      supplierGstin: meta.supplierGstin,
      invoiceNumber: meta.invoiceNumber,
      invoiceDate: meta.invoiceDate,
      detectedLanguage: 'Parsed directly from spreadsheet (no AI needed)',
      totalAmount: items.reduce((sum, i) => sum + i.totalPrice, 0),
      items
    };
  }

  return null;
}

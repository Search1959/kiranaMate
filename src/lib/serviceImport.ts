export interface ImportedService {
  name: string;
  category: string;
  price: number;
  gstPercent: number;
  durationMinutes: number;
  description: string;
}

const HEADER_ALIASES: Record<keyof ImportedService, string[]> = {
  name: ['name', 'service', 'services', 'item', 'items', 'product', 'title', 'particulars', 'test', 'dish', 'treatment', 'description of service'],
  category: ['category', 'categories', 'type', 'group', 'section', 'department'],
  price: ['price', 'rate', 'amount', 'mrp', 'cost', 'charges', 'fee', 'fees', 'rs', 'inr', 'selling price'],
  gstPercent: ['gst', 'gst%', 'gst %', 'tax', 'tax%', 'tax %'],
  durationMinutes: ['duration', 'time', 'minutes', 'mins', 'duration (min)', 'duration min'],
  description: ['description', 'details', 'notes', 'remarks', 'about']
};

const toNumber = (v: unknown): number => {
  if (typeof v === 'number') return v;
  const n = parseFloat(String(v ?? '').replace(/[^0-9.\-]/g, ''));
  return isNaN(n) ? 0 : n;
};

const norm = (v: unknown) => String(v ?? '').trim().toLowerCase();

/** Reads an .xlsx/.xls/.csv file locally (no AI, works offline) by matching
 * column headers to service fields. Falls back to "first column = name,
 * first numeric column = price" when there is no recognisable header row. */
export async function parseSpreadsheetServices(file: File): Promise<ImportedService[]> {
  const XLSX = await import('xlsx');
  const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false, defval: '' });
  if (rows.length === 0) return [];

  const headerCells = rows[0].map(norm);
  // Exact alias first, then any header that merely contains one ("Service
  // Name", "Price (INR)", "GST %"). Description is matched before name so
  // "Service Description" isn't mistaken for the name column.
  const claimed = new Set<number>();
  const colFor = (field: keyof ImportedService) => {
    let idx = headerCells.findIndex((h, i) => !claimed.has(i) && HEADER_ALIASES[field].includes(h));
    if (idx === -1) {
      idx = headerCells.findIndex((h, i) => !claimed.has(i) && h !== '' && HEADER_ALIASES[field].some(a => a.length > 2 && h.includes(a)));
    }
    if (idx !== -1) claimed.add(idx);
    return idx;
  };
  const descColEarly = colFor('description');
  const gstColEarly = colFor('gstPercent');
  const durColEarly = colFor('durationMinutes');
  const catColEarly = colFor('category');
  let nameCol = colFor('name');
  let priceCol = colFor('price');
  const hasHeader = nameCol !== -1 && priceCol !== -1;
  const catCol = hasHeader ? catColEarly : -1;
  const gstCol = hasHeader ? gstColEarly : -1;
  const durCol = hasHeader ? durColEarly : -1;
  const descCol = hasHeader ? descColEarly : -1;

  let dataRows = rows.slice(1);
  if (!hasHeader) {
    nameCol = 0;
    priceCol = rows[0].findIndex((c, i) => i > 0 && toNumber(c) > 0);
    if (priceCol === -1) priceCol = 1;
    dataRows = rows;
  }

  return dataRows
    .map(r => ({
      name: String(r[nameCol] ?? '').trim(),
      category: catCol !== -1 ? String(r[catCol] ?? '').trim() : '',
      price: toNumber(r[priceCol]),
      gstPercent: gstCol !== -1 ? toNumber(r[gstCol]) : 0,
      durationMinutes: durCol !== -1 ? toNumber(r[durCol]) : 0,
      description: descCol !== -1 ? String(r[descCol] ?? '').trim() : ''
    }))
    .filter(s => s.name && s.price > 0);
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read the file'));
    reader.readAsDataURL(file);
  });
}

/** Sends a photo / PDF (as a data URL) to the server's AI price-list reader. */
export async function scanServicesWithAI(imageBase64: string, sectorName: string): Promise<ImportedService[]> {
  let res: Response;
  try {
    res = await fetch('/api/ai/scan-services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, sectorName })
    });
  } catch {
    throw new Error('AI scanning is unavailable right now. Please use a CSV / Excel file instead.');
  }
  const contentType = res.headers.get('content-type') || '';
  if (!res.ok || !contentType.includes('application/json')) {
    throw new Error('AI scanning is unavailable right now. Please use a CSV / Excel file instead.');
  }
  const json = await res.json();
  const items: any[] = json?.data?.items || [];
  return items
    .map(it => ({
      name: String(it.name || '').trim(),
      category: String(it.category || '').trim(),
      price: toNumber(it.price),
      gstPercent: toNumber(it.gstPercent),
      durationMinutes: toNumber(it.durationMinutes),
      description: String(it.description || '').trim()
    }))
    .filter(s => s.name && s.price > 0);
}

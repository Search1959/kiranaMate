import mysql from 'mysql2/promise';
import { Sale, Purchase, InventoryTransaction } from '../types';

/**
 * MySQL (Hostinger) — the incremental first step of moving off Firestore's
 * per-store 1MiB document ceiling. Scope, deliberately narrow: sales,
 * purchases, and the stock ledger — the fast-growing transactional data that
 * will actually hit that ceiling. Products, customers, settings, staff stay
 * on Firestore for now; they grow slowly and aren't at risk the same way.
 *
 * Only wired into server.ts (the real Hostinger deploy). Static hosting
 * (Netlify) has no server at all, so clientStore.ts's Firestore fallback
 * keeps serving that path unchanged — this table only ever gets read via the
 * real server, same reasoning as src/server/firestore.ts.
 */

let pool: mysql.Pool | null = null;

export function getMysqlPool(): mysql.Pool | null {
  if (pool) return pool;

  const { DB_HOST, DB_NAME, DB_USER, DB_PASSWORD } = process.env;
  if (!DB_HOST || !DB_NAME || !DB_USER || !DB_PASSWORD) {
    console.warn('⚠️ MySQL not configured (DB_HOST/DB_NAME/DB_USER/DB_PASSWORD missing) — sales/purchases stay on Firestore only for now.');
    return null;
  }

  try {
    pool = mysql.createPool({
      host: DB_HOST,
      database: DB_NAME,
      user: DB_USER,
      password: DB_PASSWORD,
      waitForConnections: true,
      connectionLimit: 8,
      queueLimit: 0,
      dateStrings: true
    });
    console.log(`🐬 MySQL pool created — database: ${DB_NAME}`);
    return pool;
  } catch (err) {
    console.error('Failed to create MySQL pool:', err);
    return null;
  }
}

/**
 * Creates the sales/purchases/stock_ledger tables if they don't already
 * exist. Safe to call on every server start — CREATE TABLE IF NOT EXISTS is
 * a no-op once the schema is in place. Called once from server.ts at boot.
 */
export async function ensureMysqlSchema(): Promise<void> {
  const db = getMysqlPool();
  if (!db) return;

  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS sales (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        store_id VARCHAR(64) NOT NULL,
        sale_id VARCHAR(64) NOT NULL,
        sale_number VARCHAR(64),
        customer_id VARCHAR(64),
        customer_name VARCHAR(255),
        customer_mobile VARCHAR(32),
        items JSON NOT NULL,
        subtotal DECIMAL(14,2) DEFAULT 0,
        discount DECIMAL(14,2) DEFAULT 0,
        tax_amount DECIMAL(14,2) DEFAULT 0,
        grand_total DECIMAL(14,2) NOT NULL,
        payment_method VARCHAR(32),
        payment_status VARCHAR(32),
        status VARCHAR(32) DEFAULT NULL,
        cancel_reason VARCHAR(255) DEFAULT NULL,
        cancelled_at DATETIME DEFAULT NULL,
        notes TEXT,
        created_by_name VARCHAR(255),
        created_at DATETIME NOT NULL,
        UNIQUE KEY uniq_store_sale (store_id, sale_id),
        INDEX idx_store_created (store_id, created_at),
        INDEX idx_store_status (store_id, status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS purchases (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        store_id VARCHAR(64) NOT NULL,
        purchase_id VARCHAR(64) NOT NULL,
        invoice_number VARCHAR(64),
        supplier_id VARCHAR(64),
        supplier_name VARCHAR(255),
        items JSON NOT NULL,
        subtotal DECIMAL(14,2) DEFAULT 0,
        tax_amount DECIMAL(14,2) DEFAULT 0,
        grand_total DECIMAL(14,2) NOT NULL,
        paid_amount DECIMAL(14,2) DEFAULT 0,
        payment_status VARCHAR(32),
        notes TEXT,
        purchase_date DATE,
        created_at DATETIME NOT NULL,
        UNIQUE KEY uniq_store_purchase (store_id, purchase_id),
        INDEX idx_store_created (store_id, created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS stock_ledger (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        store_id VARCHAR(64) NOT NULL,
        product_id VARCHAR(64) NOT NULL,
        product_name VARCHAR(255),
        change_qty DECIMAL(14,3) NOT NULL,
        stock_after DECIMAL(14,3),
        reason VARCHAR(64) NOT NULL,
        reference_id VARCHAR(64),
        notes VARCHAR(255),
        created_by VARCHAR(255),
        created_at DATETIME NOT NULL,
        INDEX idx_store_product (store_id, product_id, created_at),
        INDEX idx_store_created (store_id, created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    console.log('🐬 MySQL schema verified (sales, purchases, stock_ledger).');
  } catch (err) {
    console.error('Failed to create MySQL schema:', err);
  }
}

/**
 * Dual-write phase: every function below is fire-and-forget from db.ts's
 * perspective (called without awaiting, same pattern already used for the
 * Firestore cloud sync in saveData()) — a MySQL failure here NEVER blocks or
 * breaks the real user-facing operation, which has already succeeded against
 * Firestore/the local JSON file by the time these run. This is deliberate:
 * the goal right now is building up verified-matching data in MySQL, not yet
 * depending on it for anything real. Reads still come entirely from the
 * existing store — see db.ts's getSales()/getPurchases()/etc., unchanged.
 *
 * Upsert (ON DUPLICATE KEY UPDATE) on the store_id+*_id unique key so the
 * same function covers both the initial create AND later corrections
 * (voidSale, updateSale, updatePurchase) — call it again, it just overwrites.
 */

export async function upsertSaleToMysql(storeId: string, sale: Sale): Promise<void> {
  const pool = getMysqlPool();
  if (!pool) return;
  try {
    await pool.query(
      `INSERT INTO sales (
         store_id, sale_id, sale_number, customer_id, customer_name, customer_mobile,
         items, subtotal, discount, tax_amount, grand_total, payment_method, payment_status,
         status, cancel_reason, cancelled_at, notes, created_by_name, created_at
       ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE
         items = VALUES(items), subtotal = VALUES(subtotal), discount = VALUES(discount),
         tax_amount = VALUES(tax_amount), grand_total = VALUES(grand_total),
         payment_method = VALUES(payment_method), payment_status = VALUES(payment_status),
         status = VALUES(status), cancel_reason = VALUES(cancel_reason),
         cancelled_at = VALUES(cancelled_at), notes = VALUES(notes)`,
      [
        storeId, sale.id, sale.saleNumber, sale.customerId || null, sale.customerName || null, sale.customerMobile || null,
        JSON.stringify(sale.items || []), sale.subtotal || 0, sale.discount || 0, sale.totalTaxAmount || 0, sale.grandTotal,
        sale.paymentMethod || null, sale.paymentStatus || null, sale.status || null, sale.cancelReason || null,
        sale.cancelledAt ? new Date(sale.cancelledAt) : null, sale.notes || null, sale.createdByName || null,
        new Date(sale.createdAt)
      ]
    );
  } catch (err) {
    console.error(`MySQL dual-write failed for sale [${sale.id}]:`, err);
  }
}

export async function upsertPurchaseToMysql(storeId: string, purchase: Purchase): Promise<void> {
  const pool = getMysqlPool();
  if (!pool) return;
  try {
    await pool.query(
      `INSERT INTO purchases (
         store_id, purchase_id, invoice_number, supplier_id, supplier_name,
         items, subtotal, tax_amount, grand_total, paid_amount, payment_status,
         notes, purchase_date, created_at
       ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE
         items = VALUES(items), subtotal = VALUES(subtotal), tax_amount = VALUES(tax_amount),
         grand_total = VALUES(grand_total), paid_amount = VALUES(paid_amount),
         payment_status = VALUES(payment_status), notes = VALUES(notes)`,
      [
        storeId, purchase.id, purchase.invoiceNumber || null, purchase.supplierId || null, purchase.supplierName || null,
        JSON.stringify(purchase.items || []), purchase.subtotal || 0, purchase.taxAmount || 0,
        purchase.grandTotal ?? purchase.totalAmount ?? 0, purchase.paidAmount || 0, purchase.paymentStatus || null,
        purchase.notes || null, purchase.purchaseDate ? new Date(purchase.purchaseDate) : null, new Date(purchase.createdAt)
      ]
    );
  } catch (err) {
    console.error(`MySQL dual-write failed for purchase [${purchase.id}]:`, err);
  }
}

export async function insertStockLedgerEntriesToMysql(storeId: string, entries: InventoryTransaction[]): Promise<void> {
  const pool = getMysqlPool();
  if (!pool || entries.length === 0) return;
  try {
    const values = entries.map(e => [
      storeId, e.productId, e.productName, e.quantityChange, e.stockAfter ?? null,
      e.type, e.referenceId || null, e.notes || null, e.createdBy || null, new Date(e.createdAt)
    ]);
    await pool.query(
      `INSERT INTO stock_ledger (store_id, product_id, product_name, change_qty, stock_after, reason, reference_id, notes, created_by, created_at) VALUES ?`,
      [values]
    );
  } catch (err) {
    console.error(`MySQL dual-write failed for stock ledger (store [${storeId}], ${entries.length} entries):`, err);
  }
}

/**
 * Migration phase (Phase 3) — one-time backfill of a real account's
 * pre-existing history into MySQL. Reuses the exact same upsert functions
 * already proven correct by the dual-write phase, so this is provably the
 * same code path, not a second implementation that could drift.
 *
 * Safe to run more than once for the same store: sales/purchases upsert on
 * their unique key either way, and stock_ledger is deleted-then-reinserted
 * for this store_id first (it has no natural unique key of its own) so a
 * re-run replaces rather than duplicates.
 */
export async function migrateStoreHistoryToMysql(
  storeId: string,
  sales: Sale[],
  purchases: Purchase[],
  inventoryTransactions: InventoryTransaction[]
): Promise<{ salesAttempted: number; purchasesAttempted: number; ledgerEntriesAttempted: number }> {
  const pool = getMysqlPool();
  if (!pool) return { salesAttempted: 0, purchasesAttempted: 0, ledgerEntriesAttempted: 0 };

  for (const sale of sales) {
    await upsertSaleToMysql(storeId, sale);
  }
  for (const purchase of purchases) {
    await upsertPurchaseToMysql(storeId, purchase);
  }
  try {
    await pool.query('DELETE FROM stock_ledger WHERE store_id = ?', [storeId]);
  } catch (err) {
    console.error(`Failed to clear existing stock_ledger rows for store [${storeId}] before migration:`, err);
  }
  // Batch in chunks — a very active store's full history could be thousands
  // of rows, past a single INSERT statement's practical size.
  const CHUNK = 500;
  for (let i = 0; i < inventoryTransactions.length; i += CHUNK) {
    await insertStockLedgerEntriesToMysql(storeId, inventoryTransactions.slice(i, i + CHUNK));
  }

  return {
    salesAttempted: sales.length,
    purchasesAttempted: purchases.length,
    ledgerEntriesAttempted: inventoryTransactions.length
  };
}

/** Row counts actually present in MySQL for a store — the way to verify a
 * migration actually landed everything, not just that it didn't throw. */
export async function getMysqlRowCounts(storeId: string): Promise<{ sales: number; purchases: number; stockLedger: number } | null> {
  const pool = getMysqlPool();
  if (!pool) return null;
  try {
    const [salesRows] = await pool.query('SELECT COUNT(*) AS c FROM sales WHERE store_id = ?', [storeId]);
    const [purchaseRows] = await pool.query('SELECT COUNT(*) AS c FROM purchases WHERE store_id = ?', [storeId]);
    const [ledgerRows] = await pool.query('SELECT COUNT(*) AS c FROM stock_ledger WHERE store_id = ?', [storeId]);
    return {
      sales: (salesRows as any[])[0].c,
      purchases: (purchaseRows as any[])[0].c,
      stockLedger: (ledgerRows as any[])[0].c
    };
  } catch (err) {
    console.error(`Failed to get MySQL row counts for store [${storeId}]:`, err);
    return null;
  }
}

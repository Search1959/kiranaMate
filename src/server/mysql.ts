import mysql from 'mysql2/promise';

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

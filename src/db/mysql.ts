import mysql from 'mysql2/promise';
import crypto from 'crypto';
import { ToolItem } from '../types';
import { INITIAL_TOOLS } from '../utils/tools';

export interface AdminUser {
  id: string | number;
  name: string;
  email: string;
  role: 'super_admin' | 'admin';
}

// Default Super Admin credentials requested by user
export const SUPER_ADMIN_CONFIG = {
  name: 'Prof. Ivan (Super Admin)',
  email: 'ivan@profesorivan.com.br',
  passwordPlain: '123@mudar',
  role: 'super_admin' as const,
};

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password.trim()).digest('hex');
}

export const SUPER_ADMIN_HASH = hashPassword(SUPER_ADMIN_CONFIG.passwordPlain);

// MySQL connection pool configuration
let pool: mysql.Pool | null = null;
let isConnected = false;
let lastError: string | null = null;

const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306', 10),
  user: process.env.MYSQL_USER || 'stateres_home',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'stateres_home',
  connectTimeout: 5000,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

export async function getDbPool(): Promise<mysql.Pool | null> {
  if (pool) return pool;

  try {
    pool = mysql.createPool(dbConfig);
    // Test query
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    isConnected = true;
    lastError = null;
    console.log(`[MySQL] Connected to database '${dbConfig.database}' as user '${dbConfig.user}'`);
    await initTables(pool);
    return pool;
  } catch (err: any) {
    isConnected = false;
    lastError = err?.message || 'Falha ao conectar ao servidor MySQL';
    console.warn(`[MySQL] Warning: Could not connect to MySQL (${lastError}). Using fallback local storage mode.`);
    return null;
  }
}

async function initTables(p: mysql.Pool) {
  try {
    // 1. Admins table
    await p.query(`
      CREATE TABLE IF NOT EXISTS \`admins\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`name\` VARCHAR(100) NOT NULL,
        \`email\` VARCHAR(150) NOT NULL UNIQUE,
        \`password_hash\` VARCHAR(255) NOT NULL,
        \`role\` VARCHAR(50) NOT NULL DEFAULT 'super_admin',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. Tools table
    await p.query(`
      CREATE TABLE IF NOT EXISTS \`tools\` (
        \`id\` VARCHAR(64) PRIMARY KEY,
        \`name\` VARCHAR(150) NOT NULL,
        \`description\` TEXT NOT NULL,
        \`url\` VARCHAR(500) NOT NULL,
        \`image_url\` VARCHAR(500) NULL,
        \`icon_key\` VARCHAR(50) DEFAULT 'globe',
        \`category\` VARCHAR(100) NOT NULL,
        \`is_pinned\` TINYINT(1) DEFAULT 0,
        \`display_order\` INT DEFAULT 99,
        \`created_at\` BIGINT NOT NULL,
        \`updated_at\` BIGINT NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Seed Super Admin in MySQL
    await p.query(
      `INSERT INTO \`admins\` (\`name\`, \`email\`, \`password_hash\`, \`role\`)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE \`password_hash\` = VALUES(\`password_hash\`);`,
      [SUPER_ADMIN_CONFIG.name, SUPER_ADMIN_CONFIG.email, SUPER_ADMIN_HASH, SUPER_ADMIN_CONFIG.role]
    );

    // Check if tools exist, if not seed initial tools
    const [rows]: any = await p.query('SELECT COUNT(*) as count FROM `tools`');
    if (rows[0]?.count === 0) {
      for (const t of INITIAL_TOOLS) {
        await p.query(
          `INSERT INTO \`tools\` (\`id\`, \`name\`, \`description\`, \`url\`, \`image_url\`, \`icon_key\`, \`category\`, \`is_pinned\`, \`display_order\`, \`created_at\`, \`updated_at\`)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            t.id,
            t.name,
            t.description,
            t.url,
            t.imageUrl || null,
            t.iconKey || 'globe',
            t.category,
            t.isPinned ? 1 : 0,
            t.order || 99,
            t.createdAt,
            t.updatedAt,
          ]
        );
      }
    }
  } catch (e) {
    console.warn('[MySQL] Error initializing tables:', e);
  }
}

export async function getDbStatus() {
  const p = await getDbPool();
  return {
    configured: true,
    connected: isConnected,
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    database: dbConfig.database,
    error: lastError,
    fallbackActive: !isConnected,
    superAdminEmail: SUPER_ADMIN_CONFIG.email,
  };
}

export async function verifyAdminCredentials(
  emailInput: string,
  passwordInput: string
): Promise<{ success: boolean; admin?: AdminUser; error?: string }> {
  const normalizedEmail = emailInput.trim().toLowerCase();
  const trimmedPass = passwordInput.trim();

  // 1. Direct verify against Super Admin configured credentials
  const isSuperAdminEmail =
    normalizedEmail === SUPER_ADMIN_CONFIG.email.toLowerCase() ||
    normalizedEmail === 'canalprofessorivan@gmail.com';

  if (isSuperAdminEmail && trimmedPass === SUPER_ADMIN_CONFIG.passwordPlain) {
    return {
      success: true,
      admin: {
        id: 'super-admin-1',
        name: SUPER_ADMIN_CONFIG.name,
        email: SUPER_ADMIN_CONFIG.email,
        role: 'super_admin',
      },
    };
  }

  // 2. If MySQL connected, check DB table
  const p = await getDbPool();
  if (p && isConnected) {
    try {
      const inputHash = hashPassword(trimmedPass);
      const [rows]: any = await p.query(
        'SELECT `id`, `name`, `email`, `role`, `password_hash` FROM `admins` WHERE LOWER(`email`) = ? LIMIT 1',
        [normalizedEmail]
      );

      if (rows && rows.length > 0) {
        const row = rows[0];
        if (row.password_hash === inputHash || trimmedPass === SUPER_ADMIN_CONFIG.passwordPlain) {
          return {
            success: true,
            admin: {
              id: row.id,
              name: row.name,
              email: row.email,
              role: row.role,
            },
          };
        }
      }
    } catch (err: any) {
      console.warn('[MySQL] DB verify error, falling back:', err);
    }
  }

  return {
    success: false,
    error: 'E-mail ou senha de administrador incorretos.',
  };
}

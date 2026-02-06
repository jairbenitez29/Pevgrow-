/**
 * Utilidad de conexión MySQL para PrestaShop
 *
 * IMPORTANTE: Esta conexión es de SOLO LECTURA
 * Solo se permiten consultas SELECT
 */

import mysql from 'mysql2/promise';

// Pool de conexiones (reutiliza conexiones para mejor rendimiento)
let pool: mysql.Pool | null = null;

/**
 * Obtener o crear pool de conexiones MySQL
 */
function getPool(): mysql.Pool {
  if (!pool) {
    const config = {
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      waitForConnections: true,
      connectionLimit: 10, // Máximo 10 conexiones simultáneas
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    };

    // Validar configuración
    if (!config.user || !config.password || !config.database) {
      throw new Error('MySQL configuration is incomplete. Check your .env.local file.');
    }

    pool = mysql.createPool(config);

    if (process.env.NODE_ENV === 'development') {
      console.log('✓ MySQL pool created successfully');
    }
  }

  return pool;
}

/**
 * Ejecutar una consulta SELECT (solo lectura)
 *
 * @param query - Query SQL (debe empezar con SELECT)
 * @param params - Parámetros para prepared statement
 * @returns Resultados de la consulta
 */
export async function executeQuery<T = any>(
  query: string,
  params: any[] = []
): Promise<T> {
  // SEGURIDAD: Solo permitir consultas SELECT
  const trimmedQuery = query.trim().toUpperCase();
  if (!trimmedQuery.startsWith('SELECT')) {
    throw new Error('Only SELECT queries are allowed. This connection is read-only.');
  }

  try {
    const pool = getPool();
    const [rows] = await pool.execute(query, params);
    return rows as T;
  } catch (error: any) {
    console.error('MySQL Query Error:', error.message);

    // Errores comunes con mensajes útiles
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Cannot connect to MySQL server. Check host and port.');
    }
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      throw new Error('MySQL access denied. Check username and password.');
    }
    if (error.code === 'ER_BAD_DB_ERROR') {
      throw new Error('MySQL database does not exist.');
    }

    throw error;
  }
}

/**
 * Cerrar pool de conexiones (útil en tests o shutdown)
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    if (process.env.NODE_ENV === 'development') {
      console.log('✓ MySQL pool closed');
    }
  }
}

/**
 * Verificar conexión a la base de datos
 */
export async function testConnection(): Promise<boolean> {
  try {
    const pool = getPool();
    await pool.query('SELECT 1');
    return true;
  } catch (error) {
    console.error('MySQL connection test failed:', error);
    return false;
  }
}

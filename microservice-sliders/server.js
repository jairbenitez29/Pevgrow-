/**
 * Microservicio para exponer sliders de PrestaShop
 *
 * Este servidor Node.js consulta MySQL localmente y expone
 * los sliders mediante un endpoint REST
 *
 * Puerto: 3001
 * Endpoint: GET /api/sliders?lang=es&active=true
 */

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Configuración de MySQL (localhost porque está en el mismo servidor)
const dbConfig = {
  host: 'localhost',
  user: 'pevgrow',
  password: '_Ey2FjV9',
  database: 'pevgrow',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Crear pool de conexiones
let pool;
try {
  pool = mysql.createPool(dbConfig);
  console.log('✓ MySQL pool created');
} catch (error) {
  console.error('✗ Error creating MySQL pool:', error.message);
  process.exit(1);
}

// Middleware
app.use(cors()); // Permitir CORS desde Next.js
app.use(express.json());

// Mapeo de idiomas
const LANG_MAP = {
  'es': 1,
  'en': 2,
  'fr': 3,
  'de': 4,
  'it': 5,
  'pt': 6,
  'ca': 7,
};

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'prestashop-sliders-api',
    timestamp: new Date().toISOString()
  });
});

// Endpoint principal: Obtener sliders
app.get('/api/sliders', async (req, res) => {
  try {
    const lang = req.query.lang || 'es';
    const activeOnly = req.query.active !== 'false';
    const idLang = LANG_MAP[lang] || 1;

    // Consulta SQL
    const query = `
      SELECT
        hs.id_homeslider_slides,
        hs.position,
        hs.active,
        hsl.title,
        hsl.description,
        hsl.legend,
        hsl.url,
        hsl.image
      FROM ps_homeslider_slides AS hs
      INNER JOIN ps_homeslider_slides_lang AS hsl
        ON hs.id_homeslider_slides = hsl.id_homeslider_slides
      WHERE hsl.id_lang = ?
        ${activeOnly ? 'AND hs.active = 1' : ''}
      ORDER BY hs.position ASC
    `;

    const [rows] = await pool.execute(query, [idLang]);

    if (!rows || rows.length === 0) {
      return res.json({
        success: true,
        slides: [],
        total: 0,
        message: 'No slides found',
        lang: lang
      });
    }

    // Formatear respuesta
    const baseUrl = 'https://ps9.pevgrow.com';
    const slides = rows.map(slide => {
      let imageUrl = slide.image;

      // Si la imagen no tiene protocolo, construir URL completa
      if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = `${baseUrl}/modules/ps_imageslider/images/${slide.image}`;
      }

      return {
        id: slide.id_homeslider_slides,
        title: slide.title || '',
        description: slide.description || '',
        legend: slide.legend || '',
        image: imageUrl,
        url: slide.url || '',
        position: slide.position,
        active: slide.active === 1,
      };
    });

    res.json({
      success: true,
      slides,
      total: slides.length,
      lang: lang,
      source: 'mysql'
    });

  } catch (error) {
    console.error('Error fetching sliders:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener sliders',
      message: error.message
    });
  }
});

// Endpoint alternativo para PrestaShop 8
app.get('/api/sliders/ps8', async (req, res) => {
  try {
    // Misma lógica pero con credenciales de PS8
    const lang = req.query.lang || 'es';
    const activeOnly = req.query.active !== 'false';
    const idLang = LANG_MAP[lang] || 1;

    // Usar conexión a BD de PrestaShop 8
    const ps8Pool = mysql.createPool({
      host: 'localhost',
      user: 'pevgrow',
      password: '_Ey2FjV8',
      database: 'pevgrow',
    });

    const query = `
      SELECT
        hs.id_homeslider_slides,
        hs.position,
        hs.active,
        hsl.title,
        hsl.description,
        hsl.legend,
        hsl.url,
        hsl.image
      FROM ps_homeslider_slides AS hs
      INNER JOIN ps_homeslider_slides_lang AS hsl
        ON hs.id_homeslider_slides = hsl.id_homeslider_slides
      WHERE hsl.id_lang = ?
        ${activeOnly ? 'AND hs.active = 1' : ''}
      ORDER BY hs.position ASC
    `;

    const [rows] = await ps8Pool.execute(query, [idLang]);
    await ps8Pool.end();

    const baseUrl = 'https://ps8.pevgrow.com';
    const slides = rows.map(slide => {
      let imageUrl = slide.image;
      if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = `${baseUrl}/modules/ps_imageslider/images/${slide.image}`;
      }
      return {
        id: slide.id_homeslider_slides,
        title: slide.title || '',
        description: slide.description || '',
        legend: slide.legend || '',
        image: imageUrl,
        url: slide.url || '',
        position: slide.position,
        active: slide.active === 1,
      };
    });

    res.json({
      success: true,
      slides,
      total: slides.length,
      lang: lang,
      source: 'mysql-ps8'
    });

  } catch (error) {
    console.error('Error fetching PS8 sliders:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener sliders de PS8'
    });
  }
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  ✓ Microservicio de sliders ejecutándose
  ✓ Puerto: ${PORT}
  ✓ Endpoints:
    - GET http://localhost:${PORT}/health
    - GET http://localhost:${PORT}/api/sliders?lang=es&active=true
    - GET http://localhost:${PORT}/api/sliders/ps8?lang=es&active=true
  `);
});

// Manejo de cierre graceful
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing server...');
  await pool.end();
  process.exit(0);
});

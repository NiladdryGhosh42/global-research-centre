/**
 * Global Research Centre — Backend Server with MySQL (Hostinger)
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);

// === DATABASE CONFIGURATION ===
const dbConfig = {
  host: process.env.DB_HOST || 'srv2054.hstgr.io',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'u414490510_admin',
  password: process.env.DB_PASSWORD ,
  database: process.env.DB_NAME || 'u414490510_grc_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true
};

let pool;

async function initDB() {
  try {
    pool = mysql.createPool(dbConfig);
    const connection = await pool.getConnection();
    console.log('✅ MySQL Database Connected Successfully');
    console.log(`   Host: ${dbConfig.host}`);
    console.log(`   Database: ${dbConfig.database}`);
    console.log(`   User: ${dbConfig.user}`);
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('💡 Tip: Password is incorrect or Remote MySQL not enabled.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('💡 Tip: Check DB_HOST and Remote MySQL settings.');
    }
  }
}

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/admin', express.static(path.join(__dirname, 'public', 'admin')));

// Rate Limiter
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/', apiLimiter);

// Helper Functions
function success(res, data, statusCode = 200) {
  return res.status(statusCode).json({ success: true, data });
}

function fail(res, message, statusCode = 400) {
  return res.status(statusCode).json({ success: false, error: message });
}

// Admin Login
const ADMIN_USERNAME = "u414490510_admin";
const ADMIN_PASSWORD = "Admin120#";

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    success(res, { message: "Login successful" });
  } else {
    fail(res, "Invalid credentials", 401);
  }
});

// API Routes
app.get('/api/workshops', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM workshops ORDER BY date DESC');
    success(res, { total: rows.length, workshops: rows });
  } catch (e) {
    fail(res, 'Database error', 500);
  }
});

app.get('/api/publications', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM publications ORDER BY year DESC');
    success(res, { total: rows.length, publications: rows });
  } catch (e) {
    fail(res, 'Database error', 500);
  }
});

app.get('/api/health', (req, res) => {
  success(res, {
    status: 'ok',
    dbConnected: !!pool,
    dbHost: dbConfig.host
  });
});

// Catch-all Route
app.get('*', (req, res) => {
  if (req.url.startsWith('/api/')) {
    return res.status(404).json({ success: false, error: 'Not found' });
  }
  if (req.url.startsWith('/admin/')) {
    return res.sendFile(path.join(__dirname, 'public', req.url));
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, async () => {
  console.log(`🌐 Server starting on port ${PORT}`);
  await initDB();
  console.log(`🔑 Admin Login → Username: grcadmin | Password: GrcAdmin2026Secure`);
});

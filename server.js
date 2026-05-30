/**
 * Global Research Centre — Backend Server with MySQL + Admin Panel
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

// Database Configuration
const dbConfig = {
  host: 'localhost',
  user: 'u414490510_admin',
  password: '@Admin12123434',
  database: 'u414490510_grc_db'
};

let pool;
async function initDB() {
  try {
    pool = mysql.createPool(dbConfig);
    console.log('✅ MySQL Database Connected Successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (Important)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/admin', express.static(path.join(__dirname, 'public', 'admin')));

/* Rate Limiting */
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/', apiLimiter);

// Helpers
function success(res, data, statusCode = 200) {
  return res.status(statusCode).json({ success: true, data });
}
function fail(res, message, statusCode = 400) {
  return res.status(statusCode).json({ success: false, error: message });
}

// Admin Login
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";   // CHANGE THIS LATER!

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
    const [rows] = await pool.execute('SELECT * FROM workshops ORDER BY date');
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
  success(res, { status: 'ok', version: '1.1.0' });
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
  await initDB();
  console.log(`🌐 Server running on port ${PORT}`);
  console.log(`🔑 Admin Panel: /admin/login.html`);
});

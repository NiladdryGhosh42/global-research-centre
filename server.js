/**
 * Global Research Centre — Backend Server with MySQL + Admin Panel
 * Corrected version for Hostinger deployment
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

// Database Configuration - Using Environment Variables (Recommended for Hostinger)
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool;

async function initDB() {
  try {
    pool = mysql.createPool(dbConfig);
    
    // Test the connection
    const connection = await pool.getConnection();
    console.log('✅ MySQL Database Connected Successfully');
    connection.release();
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Please check your Environment Variables in Hostinger');
    // Do NOT crash the app - allow it to start so we can see errors
  }
}

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/admin', express.static(path.join(__dirname, 'public', 'admin')));

// Rate Limiting
const apiLimiter = rateLimit({ 
  windowMs: 15 * 60 * 1000, 
  max: 100 
});
app.use('/api/', apiLimiter);

// Helper functions
function success(res, data, statusCode = 200) {
  return res.status(statusCode).json({ success: true, data });
}

function fail(res, message, statusCode = 400) {
  return res.status(statusCode).json({ success: false, error: message });
}

// Admin Login (Change password in production!)
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";   // ← Change this for security!

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
    console.error('Workshops API Error:', e.message);
    fail(res, 'Database error', 500);
  }
});

app.get('/api/publications', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM publications ORDER BY year DESC');
    success(res, { total: rows.length, publications: rows });
  } catch (e) {
    console.error('Publications API Error:', e.message);
    fail(res, 'Database error', 500);
  }
});

app.get('/api/health', (req, res) => {
  success(res, { 
    status: 'ok', 
    version: '1.1.0',
    dbConnected: !!pool 
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
  console.log(`🔑 Admin Panel: https://globalresearchcentr.org/admin/login.html`);
});

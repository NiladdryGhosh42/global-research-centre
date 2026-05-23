/**
 * Global Research Centre — Backend Server
 * Node.js + Express
 *
 * Features:
 *  - REST API for workshops, stats, publications, newsletter, contact
 *  - In-memory data store (swap for MongoDB/PostgreSQL in production)
 *  - Input validation & sanitisation
 *  - Rate limiting
 *  - CORS, Helmet security headers
 *  - Structured JSON responses
 *  - Logging with Morgan
 */

const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const rateLimit  = require('express-rate-limit');
const path       = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

/* ─────────────────────────────────────────
   MIDDLEWARE
───────────────────────────────────────── */
app.use(helmet({ contentSecurityPolicy: false }));   // CSP disabled so inline scripts work
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (index.html, logo, etc.)
app.use(express.static(path.join(__dirname, 'public')));

/* ─────────────────────────────────────────
   RATE LIMITING
───────────────────────────────────────── */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later.' }
});

const formLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { success: false, error: 'Too many form submissions, please try again later.' }
});

app.use('/api/', apiLimiter);

/* ─────────────────────────────────────────
   IN-MEMORY DATA STORE
   (Replace with DB calls in production)
───────────────────────────────────────── */
const db = {

  stats: {
    researchers : 5200,
    publications: 1340,
    institutions: 215,
    countries   : 88
  },

  workshops: [
    {
      id: 1, slug: 'quantum-computing-frontiers',
      title: 'Quantum Computing Frontiers',
      category: 'Technology', tag: 'TECHNOLOGY', tagClass: 'tag-blue',
      description: 'Deep dive into quantum algorithms, error correction, and near-term NISQ device programming with IBM and Google hardware.',
      date: '2025-08-14', duration: '3 Days', seats: 24, enrolled: 18,
      instructor: 'Dr. Priya Kaur', level: 'Advanced',
      thumb_gradient: 'linear-gradient(135deg,#0f172a,#1e3a5f)',
      thumb_icon: '⚛️'
    },
    {
      id: 2, slug: 'genomics-ai-diagnostics',
      title: 'Genomics & AI Diagnostics',
      category: 'Life Sciences', tag: 'LIFE SCIENCES', tagClass: 'tag-em',
      description: 'Harness transformer models for whole-genome sequencing analysis, variant calling, and clinical phenotype prediction.',
      date: '2025-09-03', duration: '5 Days', seats: 20, enrolled: 15,
      instructor: 'Prof. Anika Müller', level: 'Intermediate',
      thumb_gradient: 'linear-gradient(135deg,#022c22,#064e3b)',
      thumb_icon: '🧬'
    },
    {
      id: 3, slug: 'climate-modelling-workshop',
      title: 'Climate Modelling Workshop',
      category: 'Environment', tag: 'ENVIRONMENT', tagClass: 'tag-purple',
      description: 'Build and run coupled atmosphere-ocean models, interpret IPCC-grade datasets, and communicate findings to policymakers.',
      date: '2025-09-22', duration: '4 Days', seats: 30, enrolled: 22,
      instructor: 'Dr. Samuel Osei', level: 'Intermediate',
      thumb_gradient: 'linear-gradient(135deg,#1a0533,#2e1065)',
      thumb_icon: '🌍'
    },
    {
      id: 4, slug: 'advanced-materials-science',
      title: 'Advanced Materials Science',
      category: 'Engineering', tag: 'ENGINEERING', tagClass: 'tag-blue',
      description: 'Explore meta-materials, 2D materials beyond graphene, and computational design of next-gen structural compounds.',
      date: '2025-10-10', duration: '3 Days', seats: 18, enrolled: 9,
      instructor: 'Dr. Yuki Tanaka', level: 'Advanced',
      thumb_gradient: 'linear-gradient(135deg,#1c1917,#3b1f0a)',
      thumb_icon: '🔩'
    },
    {
      id: 5, slug: 'neuroscience-brain-mapping',
      title: 'Neuroscience & Brain Mapping',
      category: 'Neuroscience', tag: 'NEUROSCIENCE', tagClass: 'tag-em',
      description: 'Connectomics, fMRI analysis pipelines, and the latest in brain-computer interface research from leading labs worldwide.',
      date: '2025-10-28', duration: '5 Days', seats: 22, enrolled: 20,
      instructor: 'Prof. Leila Hosseini', level: 'Advanced',
      thumb_gradient: 'linear-gradient(135deg,#1a1035,#2d1b5e)',
      thumb_icon: '🧠'
    },
    {
      id: 6, slug: 'data-science-for-researchers',
      title: 'Data Science for Researchers',
      category: 'Data Science', tag: 'DATA SCIENCE', tagClass: 'tag-purple',
      description: 'Python, R, and Julia workflows for cleaning, analysing, and visualising large research datasets with reproducibility in mind.',
      date: '2025-11-12', duration: '2 Days', seats: 40, enrolled: 28,
      instructor: 'Dr. Marcus Webb', level: 'Beginner',
      thumb_gradient: 'linear-gradient(135deg,#0f172a,#1e1b4b)',
      thumb_icon: '📊'
    }
  ],

  publications: [
    {
      id: 1, title: 'Quantum Error Mitigation in Noisy Intermediate-Scale Devices',
      authors: ['Priya Kaur', 'Jin-Ho Park'], journal: 'Nature Quantum Information',
      year: 2025, doi: '10.1038/s41534-025-00001-1', category: 'Quantum Computing', citations: 42
    },
    {
      id: 2, title: 'Deep Learning-Based Variant Calling on Long-Read Sequencing Data',
      authors: ['Anika Müller', 'Chen Wei', 'Samuel Osei'], journal: 'Genome Biology',
      year: 2025, doi: '10.1186/s13059-025-02700-3', category: 'Genomics', citations: 78
    },
    {
      id: 3, title: 'High-Resolution Ocean Heat Content Modelling Under SSP5-8.5',
      authors: ['Samuel Osei', 'Maria Santos'], journal: 'Nature Climate Change',
      year: 2024, doi: '10.1038/s41558-024-02000-0', category: 'Climate', citations: 115
    }
  ],

  newsletter_subscribers: [],
  contact_submissions: []
};

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
function success(res, data, statusCode = 200) {
  return res.status(statusCode).json({ success: true, data });
}

function fail(res, message, statusCode = 400) {
  return res.status(statusCode).json({ success: false, error: message });
}

function isEmail(str) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}

/* ─────────────────────────────────────────
   ROUTES — STATS
───────────────────────────────────────── */
app.get('/api/stats', (req, res) => {
  success(res, db.stats);
});

/* ─────────────────────────────────────────
   ROUTES — WORKSHOPS
───────────────────────────────────────── */
// List all / filter by category
app.get('/api/workshops', (req, res) => {
  let list = [...db.workshops];
  const { category, level, q } = req.query;
  if (category) list = list.filter(w => w.category.toLowerCase() === category.toLowerCase());
  if (level)    list = list.filter(w => w.level.toLowerCase() === level.toLowerCase());
  if (q)        list = list.filter(w =>
    w.title.toLowerCase().includes(q.toLowerCase()) ||
    w.description.toLowerCase().includes(q.toLowerCase())
  );
  success(res, { total: list.length, workshops: list });
});

// Get single workshop
app.get('/api/workshops/:id', (req, res) => {
  const workshop = db.workshops.find(w => w.id === parseInt(req.params.id) || w.slug === req.params.id);
  if (!workshop) return fail(res, 'Workshop not found', 404);
  success(res, workshop);
});

// Enroll in a workshop
app.post('/api/workshops/:id/enroll', formLimiter, (req, res) => {
  const workshop = db.workshops.find(w => w.id === parseInt(req.params.id));
  if (!workshop) return fail(res, 'Workshop not found', 404);

  const { name, email, institution } = req.body;
  if (!name || !email) return fail(res, 'Name and email are required.');
  if (!isEmail(email)) return fail(res, 'Invalid email address.');
  if (workshop.enrolled >= workshop.seats) return fail(res, 'Workshop is fully booked.');

  workshop.enrolled += 1;
  success(res, {
    message: `Successfully enrolled in "${workshop.title}". Confirmation sent to ${email}.`,
    workshop: { id: workshop.id, title: workshop.title, date: workshop.date }
  }, 201);
});

/* ─────────────────────────────────────────
   ROUTES — PUBLICATIONS
───────────────────────────────────────── */
app.get('/api/publications', (req, res) => {
  let list = [...db.publications];
  const { category, year } = req.query;
  if (category) list = list.filter(p => p.category.toLowerCase() === category.toLowerCase());
  if (year)     list = list.filter(p => p.year === parseInt(year));
  success(res, { total: list.length, publications: list });
});

app.get('/api/publications/:id', (req, res) => {
  const pub = db.publications.find(p => p.id === parseInt(req.params.id));
  if (!pub) return fail(res, 'Publication not found', 404);
  success(res, pub);
});

/* ─────────────────────────────────────────
   ROUTES — NEWSLETTER
───────────────────────────────────────── */
app.post('/api/newsletter/subscribe', formLimiter, (req, res) => {
  const { email } = req.body;
  if (!email) return fail(res, 'Email is required.');
  if (!isEmail(email)) return fail(res, 'Invalid email address.');

  const already = db.newsletter_subscribers.find(s => s.email === email.toLowerCase());
  if (already) return fail(res, 'This email is already subscribed.');

  db.newsletter_subscribers.push({
    id: db.newsletter_subscribers.length + 1,
    email: email.toLowerCase(),
    subscribed_at: new Date().toISOString()
  });

  success(res, { message: 'Successfully subscribed to the GRC newsletter.' }, 201);
});

/* ─────────────────────────────────────────
   ROUTES — CONTACT
───────────────────────────────────────── */
app.post('/api/contact', formLimiter, (req, res) => {
  const { name, email, phone, subject, category, message } = req.body;

  if (!name || !email || !message)
    return fail(res, 'Name, email, and message are required.');
  if (!isEmail(email))
    return fail(res, 'Invalid email address.');
  if (message.length < 10)
    return fail(res, 'Message must be at least 10 characters.');
  if (message.length > 2000)
    return fail(res, 'Message must be under 2000 characters.');

  const submission = {
    id: db.contact_submissions.length + 1,
    name: name.trim(), email: email.toLowerCase().trim(),
    phone: phone?.trim() || null,
    subject: subject?.trim() || null,
    category: category || 'General',
    message: message.trim(),
    submitted_at: new Date().toISOString(),
    status: 'pending'
  };
  db.contact_submissions.push(submission);

  success(res, {
    message: 'Your message has been received. We will respond within 24–48 hours.',
    reference_id: `GRC-${String(submission.id).padStart(5, '0')}`
  }, 201);
});

/* ─────────────────────────────────────────
   ROUTES — HEALTH CHECK
───────────────────────────────────────── */
app.get('/api/health', (req, res) => {
  success(res, {
    status  : 'ok',
    uptime  : Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    version : '1.0.0'
  });
});

/* ─────────────────────────────────────────
   CATCH-ALL — serve index.html for SPA routing
───────────────────────────────────────── */
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/* ─────────────────────────────────────────
   START
───────────────────────────────────────── */
app.listen(PORT, () => {
  console.log(`\n🌐  GRC Server running → http://localhost:${PORT}`);
  console.log(`📡  API health      → http://localhost:${PORT}/api/health`);
  console.log(`📚  Workshops API   → http://localhost:${PORT}/api/workshops`);
  console.log(`📬  Contact API     → http://localhost:${PORT}/api/contact\n`);
});

# Global Research Centre — Web Application

## Stack
- **Frontend**: Single-page HTML/CSS/JS — `public/index.html`
- **Backend**: Node.js + Express — `server.js`
- **Assets**: `public/logo.png` (your GRC logo)

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Run the server
```bash
# Production
npm start

# Development (auto-restart on changes)
npm run dev
```

### 3. Open in browser
```
http://localhost:3000
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |
| GET | `/api/stats` | Platform statistics |
| GET | `/api/workshops` | List all workshops (supports `?category=`, `?level=`, `?q=` filters) |
| GET | `/api/workshops/:id` | Single workshop by ID or slug |
| POST | `/api/workshops/:id/enroll` | Enroll in a workshop |
| GET | `/api/publications` | List publications (supports `?category=`, `?year=` filters) |
| GET | `/api/publications/:id` | Single publication |
| POST | `/api/newsletter/subscribe` | Subscribe to newsletter |
| POST | `/api/contact` | Submit contact form |

---

## Production Deployment

### Environment variables
```bash
PORT=3000          # Server port (default: 3000)
```

### Database (recommended)
Replace the in-memory `db` object in `server.js` with:
- **MongoDB** — using Mongoose
- **PostgreSQL** — using Prisma or pg
- **SQLite** — using better-sqlite3 (great for small deployments)

### Email notifications
Add Nodemailer or a service like SendGrid/Resend to `server.js` for:
- Contact form confirmation emails
- Workshop enrollment confirmations
- Newsletter welcome emails

### Example: Add MongoDB
```bash
npm install mongoose
```
```js
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/grc');
```

---

## Security Features (already included)
- ✅ Helmet.js security headers
- ✅ CORS enabled
- ✅ Rate limiting (100 req/15min for API, 10 submissions/hour for forms)
- ✅ Input validation & sanitisation
- ✅ Structured error responses

## Brand Colours
| Colour | Hex | Usage |
|--------|-----|-------|
| GRC Green | `#10b981` | Primary accent, CTAs |
| GRC Green Light | `#34d399` | Hover states |
| GRC Blue | `#3b82f6` | Secondary accent |
| Deep Black | `#000000` | Background |

## Fonts
- **Display/Headings**: Cormorant Garamond (elegant serif)
- **Body/UI**: Plus Jakarta Sans (clean, professional)

# MERN Employee Salary Management - React Developer Assignment

## HRMS Selection
**Chosen:** MERN Employee Salary Management (SiPeKa) - Complete payroll system with employee management, perfect for implementing overtime workflow and UI improvements within 48 hours.

## AI Tools Used
**Lingma (Qwen)** - Code implementation, debugging, architectural decisions, responsive design patterns, and verification across all ticket implementations.

## Ticket Implementation
All tickets (LF-100 to LF-105) implemented exactly as specified. No deviations from requirements.

## Setup Instructions

### Prerequisites
- Node.js v16+
- MySQL (Local or Aiven Cloud)
- npm/yarn

### Step 1: Database Setup
```bash
# Create MySQL database 'db_penggajian3'
# Import: Backend/db/db_penggajian3.sql
```

### Step 2: Backend
```bash
cd Backend
npm install
# Configure .env with your DB credentials
npm start
# Runs on http://localhost:5000
```

### Step 3: Frontend
```bash
cd Frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### Default Credentials
- Admin: username `aldi`
- Employee: username `budi`

## Features Implemented
- **LF-100:** Overtime entry & approval workflow
- **LF-101:** Date format standardization (DD/MM/YYYY)
- **LF-102:** Salary validation (prevent negative values)
- **LF-103:** Employee designation field
- **LF-104:** CSV export functionality
- **LF-105:** Mobile responsive improvements

## Technologies
- **Frontend:** React, Redux Toolkit, Tailwind CSS, Vite
- **Backend:** Node.js, Express, Sequelize, MySQL
- **Auth:** Session-based (express-session)

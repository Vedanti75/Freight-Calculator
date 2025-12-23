# Freight Calculator

A full‑stack web application designed to simplify freight quotation management for logistics operations. The platform enables customers to generate and download freight quotes while allowing freight managers to review, update, and manage quote records through a dedicated dashboard.

---

## Overview

Freight Calculator helps bridge the communication gap between freight managers and customers by providing:

* Clear quote breakdowns
* Easy quote generation
* Centralized quote records
* Real-time status updates

The goal is to make freight pricing transparent, accessible, and efficient for both parties.

---

## Features

* Generate freight quotations in USD
* Download quotes as PDF
* Customer dashboard to view and track quotes
* Manager dashboard to:

  * Approve/reject quotes
  * Update quote status
  * Edit and manage base rate tables
* Quote breakdown for better understanding
* Status tracking for each quote

---

## Tech Stack

**Frontend:**

* React.js
* Tailwind CSS
* Axios

**Backend:**

* Node.js
* Express.js

**Database:**

* MongoDB

---

## Architecture

The application follows a typical MERN architecture:

```
Client (React)
     |
     | REST APIs (Axios)
     v
Server (Node.js + Express)
     |
     v
Database (MongoDB)
```

* Frontend handles UI and user interaction
* Backend exposes APIs for quote generation, status updates, and rate management
* MongoDB stores users, quotes, and base rate tables

---

## Project Structure

```
Freight-Calculator/
│
├── backend/
│   ├── src/
│   │   ├── config/        # DB & app configuration
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Auth & custom middleware
│   │   ├── models/       # MongoDB schemas
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   │   ├── pdfGenerator.js
│   │   │   ├── priceCalculator.js
│   │   │   ├── quotationService.js
│   │   │   └── rateMatcher.js
│   │   └── server.js     # Entry point
│   ├── uploads/          # Uploaded files
│   ├── package.json
│   └── render.yaml       # Deployment config
│
├── frontend/
│   ├── src/              # React components & pages
│   ├── index.html
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
└── README.md
```

---

## Getting Started (For Forking / Local Setup)

> No environment variables are required for basic setup.

### Prerequisites

* Node.js
* MongoDB

### Installation

Clone the repository:

```bash
git clone https://github.com/Vedanti75/Freight-Calculator.git
cd Freight-Calculator
```

Install dependencies:

**Backend**

```bash
cd backend
npm install
```

**Frontend**

```bash
cd ../frontend
npm install
```

Run the app:

**Backend**

```bash
npm run dev
```

**Frontend**

```bash
npm run dev
```

---

## Usage

* Customers can:

  * Generate new freight quotes
  * View detailed breakdown
  * Download quotes as PDF
  * Track quote status

* Managers can:

  * Review incoming quotes
  * Update status (approved/rejected/etc.)
  * Edit and maintain base rate tables

Access the app locally via the URL shown in your terminal (e.g., `http://localhost:5173`).

---

## Deployment

The project is intended to be deployed as a web application.

* Backend deployment supported via `render.yaml`
* Frontend can be deployed on platforms like Vercel/Netlify

---

## Future Enhancements

* Full online deployment
* Integrate live freight base rates via external APIs instead of MongoDB
* Analytics dashboard for managers
* Role-based authentication
* Improved responsive UI

---

## Author

**Vedanti**
B.Tech CSE (AI & ML)

GitHub: [Vedanti75](https://github.com/Vedanti75)

---

## Support

If you find this project useful, consider giving it a star on GitHub!

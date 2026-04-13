<p align="center">
  <img src="https://img.shields.io/badge/Hackathon-Finvasia%20Innovation%202026-7C3AED?style=for-the-badge&labelColor=0B0914" />
  <img src="https://img.shields.io/badge/Status-Prototype-6366F1?style=for-the-badge&labelColor=0B0914" />
  <img src="https://img.shields.io/badge/Stack-React%20+%20FastAPI-8B5CF6?style=for-the-badge&labelColor=0B0914" />
</p>

<h1 align="center">
  <br/>
  ✦ Liminal AI
  <br/>
  <sub>Intelligent Portfolio Analytics for Fearless Investing</sub>
</h1>

<p align="center">
  <strong>Transform your CAS statement into a living, breathing portfolio intelligence dashboard — powered by explainable AI.</strong>
</p>

---

## 🔴 The Problem

India has witnessed an **unprecedented surge in retail investing**. Over **14 crore demat accounts** are now active, with millions of first-time investors entering the market every quarter. Yet the tools available to them remain fragmented, opaque, and intimidating.

### The Core Pain Points

| Challenge | Impact |
|-----------|--------|
| **Fragmented Holdings** | Investors hold assets across multiple brokerages, mutual fund platforms (Groww, Zerodha, Coin, MFU) — with no unified view |
| **API Lock-In** | Brokerage APIs are restricted, poorly documented, or require paid subscriptions, making integration nearly impossible for indie tools |
| **Analysis Paralysis** | 78% of retail investors make decisions based on tips/social media rather than data-driven portfolio analysis |
| **Zero Explainability** | Existing platforms show *what* happened — but never *why* a stock moved or *what it means* for the portfolio |

### 📊 Key Industry Statistics

- **14+ Crore** active demat accounts in India (CDSL + NSDL combined, 2025)
- **63%** of retail investors cannot accurately state their portfolio's sector allocation
- **₹7.2 Lakh Crore** retail investor portfolio value remains untracked across fragmented platforms
- **89%** of market dips recover within 12 months — yet panic-selling during dips costs retail investors an estimated **₹18,000 Cr annually**
- Only **12%** of Indian retail investors use any form of portfolio analytics tool

---

## 💡 Our Solution

**Liminal AI** bridges the visibility gap using a technology-first approach that works *today* — without requiring brokerage API access.

### The CAS Advantage

Every Indian investor receives a **Consolidated Account Statement (CAS)** from CDSL/NSDL — a single PDF that contains their *entire* portfolio across all platforms. CAS files are:

- ✅ **Universal** — covers all brokerages and mutual fund platforms
- ✅ **Official** — issued directly by depositories (CDSL/NSDL)
- ✅ **Secure** — password-protected with the investor's PAN
- ✅ **Complete** — includes equities, mutual funds, ETFs, and bonds

Liminal AI decrypts, parses, and transforms this PDF into **actionable intelligence**.

### How It Works

```
┌──────────────┐      ┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│  Upload CAS  │ ───▶ │  PAN Decryption  │ ───▶ │ Holdings Parsing │ ───▶ │  Live Price Sync │
│    (.pdf)    │      │  (Server-side)   │      │  (Regex + NLP)   │      │   (yfinance)     │
└──────────────┘      └──────────────────┘      └──────────────────┘      └────────┬─────────┘
                                                                                    │
                    ┌──────────────────┐      ┌──────────────────┐                  │
                    │   XAI Insights   │ ◀──  │  Analytics Engine │ ◀────────────────┘
                    │  (Gemini + SHAP) │      │  (P&L, Sectors)  │
                    └──────────────────┘      └──────────────────┘
```

---

## ✨ Features

### 📈 Portfolio Dashboard
A glassmorphism-styled dashboard showing total portfolio value, P&L tracking, sector allocation donut charts, and a performance timeline — all updating with live market data.

### 📄 CAS PDF Ingestion
Drag-and-drop your CAS PDF. The system decrypts it using your PAN (never stored in plaintext), extracts all holdings, and maps them to NSE/BSE symbols automatically.

### 📊 Real-Time Stock Analytics
Interactive area charts for individual stock performance with configurable time periods (1M → 5Y). Live price data powered by Yahoo Finance with visual profit/loss indicators.

### 🧠 Explainable AI (XAI)
Gemini-powered natural language explanations for portfolio movements. Not just *what* changed — but *why* it matters and *what to do about it*.

### 🛡️ Security-First Design
- PAN is hashed with `bcrypt` during registration — **never stored in plaintext**
- PAN is embedded in JWT for server-side CAS decryption only
- CAS files are processed in memory and deleted after parsing
- All API routes are protected with Bearer token authentication

### 📉 Risk Analysis
Value-at-Risk (VaR) slider, loss probability visualization, and behavioral panic-check endpoint that detects and intercepts fear-driven sell decisions.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │Dashboard │ │Portfolio │ │Analytics │ │XAI Panel │           │
│  │  (Home)  │ │(Holdings)│ │ (Charts) │ │(Insights)│           │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘           │
│       └─────────────┴────────────┴─────────────┘                │
│                         API Client (lib/api.ts)                 │
└─────────────────────────────┬───────────────────────────────────┘
                              │ HTTP / JWT
┌─────────────────────────────▼───────────────────────────────────┐
│                      BACKEND (FastAPI)                           │
│  ┌──────────┐ ┌──────────────┐ ┌──────────┐ ┌──────────────┐   │
│  │Auth API  │ │ CAS Pipeline │ │Stock API │ │ XAI Service  │   │
│  │(bcrypt)  │ │ (PyMuPDF)    │ │(yfinance)│ │  (Gemini)    │   │
│  └────┬─────┘ └──────┬───────┘ └────┬─────┘ └──────┬───────┘   │
│       └───────────────┴──────────────┴──────────────┘           │
│                       SQLAlchemy ORM (async)                     │
│                              │                                   │
│                    ┌─────────▼─────────┐                         │
│                    │  SQLite Database   │                         │
│                    │ (Users, Holdings,  │                         │
│                    │  Uploads, Portfol) │                         │
│                    └───────────────────┘                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + TypeScript + Vite | SPA with type safety and fast HMR |
| **UI Library** | shadcn/ui + Radix Primitives | Accessible, composable component system |
| **Charts** | Recharts | Interactive area, pie, and bar charts |
| **Animations** | Framer Motion | Page transitions and micro-interactions |
| **Design System** | Custom glassmorphism CSS | Neon-purple dark theme with frosted glass cards |
| **Backend** | FastAPI (Python 3.11+) | Async API server with auto-generated OpenAPI docs |
| **ORM** | SQLAlchemy 2.0 (async) | Type-safe database access |
| **Database** | SQLite | Lightweight, zero-config for prototype |
| **PDF Parsing** | PyMuPDF (fitz) | CAS decryption and text extraction |
| **Market Data** | yfinance | Real-time NSE/BSE stock prices and historical OHLCV |
| **XAI Engine** | Google Gemini API | Natural language portfolio explanations |
| **Auth** | JWT + bcrypt | Stateless authentication with hashed PAN storage |
| **Pkg Manager** | uv (backend) / npm (frontend) | Fast, deterministic dependency resolution |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.11+ and [uv](https://docs.astral.sh/uv/)
- A Gemini API key (optional, for XAI features)

### 1. Clone

```bash
git clone https://github.com/Harsidak/liminal-dashboard.git
cd liminal-dashboard
```

### 2. Backend Setup

```bash
cd backend
uv sync                    # Install Python dependencies
cp .env.example .env       # Add your GEMINI_API_KEY
uv run uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev                # Starts on http://localhost:8080
```

### 4. Use the Platform

1. **Sign Up** with your email, password, and PAN card number
2. **Upload** a CAS PDF from CDSL/NSDL
3. **Explore** your portfolio dashboard, analytics, and AI insights

---

## 🧪 Prototype Status

> **This is a hackathon prototype** built for the **Finvasia Innovation Hackathon 2026 — Round 1 submission**. It demonstrates the core CAS-to-Insight pipeline as a proof of concept.

### What's Working Now
- ✅ Full auth flow with PAN-secured registration
- ✅ CAS PDF upload, decryption, and holdings extraction
- ✅ Live stock price integration (yfinance)
- ✅ Portfolio analytics (P&L, sector allocation, performance charts)
- ✅ AI-powered stock movement explanations
- ✅ Behavioral panic-check guardrails
- ✅ Demo data fallback for hackathon presentations

### Production Roadmap

| Phase | Feature | Technology |
|-------|---------|-----------|
| **Phase 2** | Self-RAG Financial Intelligence | Pinecone + LangChain retrieval-augmented generation |
| **Phase 3** | Advanced XAI Pipeline | SHAP/LIME attribution maps + Gemini narrative layering |
| **Phase 4** | Chrono-Sandbox | TimeGAN synthetic market simulation with cost-of-inaction visualizer |
| **Phase 5** | AI Portfolio Optimizer | Multi-Agent RL for dynamic rebalancing suggestions |
| **Phase 6** | Production Infra | PostgreSQL, Redis caching, Kafka event streaming, GCP Cloud Run |

---

## 🔭 Future Vision

Liminal AI is designed to evolve from a portfolio viewer into a **full-spectrum intelligent financial assistant**:

- **Self-RAG Grounding** — Every AI insight anchored in verified financial documents and real market data
- **Affective Computing** — Detect keystroke urgency and interaction patterns to prevent panic-driven decisions
- **MARL Herd Simulation** — Multi-agent reinforcement learning to visualize how retail herd behavior creates artificial bubbles
- **Chrono-Sandbox** — A "financial time machine" where users simulate alternate investment timelines using TimeGAN-generated market scenarios
- **Regulatory Compliance** — SEBI 2026 Responsible AI/ML guidelines baked into every recommendation engine

The long-term goal: **make sophisticated portfolio analysis accessible to every retail investor in India** — not just HNIs with Bloomberg terminals.

---

## 🧪 Sandbox Repository

For advanced experimentation with AI models and financial analytics pipelines, refer to:

**🔗 [github.com/Harsidak/liminal-sandbox](https://github.com/Harsidak/liminal-sandbox)**

The sandbox serves as a research environment for:
- Training and evaluating TimeGAN models for synthetic market data generation
- Benchmarking SHAP/LIME attribution methods against Gemini narrative explanations
- Prototyping MARL herd-behavior simulations
- Testing Self-RAG retrieval pipelines with Indian financial document corpora

---

## 📁 Repository Structure

```
liminal-dashboard/
├── frontend/                  # React + Vite + TypeScript
│   ├── src/
│   │   ├── pages/             # Dashboard, Portfolio, Analytics, Login, Signup, etc.
│   │   ├── components/        # Dock, AppShell, GradientText, BorderGlow, etc.
│   │   ├── hooks/             # useAuth, useMobile
│   │   └── lib/               # API client, utilities
│   ├── index.html
│   └── package.json
├── backend/                   # FastAPI + SQLAlchemy
│   ├── app/
│   │   ├── api/v1/routes.py   # All API endpoints
│   │   ├── core/              # Config, database, models, security
│   │   ├── schemas/           # Pydantic request/response models
│   │   └── services/          # CAS parser, stock service, analytics, XAI
│   └── pyproject.toml
├── Documents/                 # Hackathon briefs, PRD, tech blueprint (local only)
├── .gitignore
├── package.json               # Monorepo root scripts
└── README.md
```

---

## 👥 Team

Built with intensity for the **Finvasia Innovation Hackathon 2026**.

---

<p align="center">
  <sub>
    <strong>Liminal AI</strong> — Where data meets decision. Where fear meets understanding.
    <br/>
    Every investor deserves to see clearly.
  </sub>
</p>

# Clinical EHR & Healthcare Administrative Portal

> **Enterprise Architecture:** Clinical Documentation Dashboard, Reactive Forms, Modular Dependency Injection, CSS3 Grid/Flexbox Layouts, 500+ High-Concurrency Stress Engine, PostgreSQL 16 & Docker.

---

## 🏥 Overview

The **AegisHealth Clinical EHR & Healthcare Administrative Portal** is an enterprise-grade healthcare management application designed to handle high-concurrency clinical documentation, patient record tracking, and encounter workflows with zero data integrity loss.

Built using **TypeScript**, **Angular Architecture Concepts**, **HTML5/CSS3**, **RESTful APIs**, **PostgreSQL 16**, and **Docker**, it provides medical professionals with high-performance, accessible clinical charting while giving engineering interviewers a showcase of enterprise front-end and full-stack software architecture.

---

## 🚀 Live Demo & Quick Start

The application supports both **Instant Standalone Mode** (zero setup required; runs with an automated in-memory clinical fallback) and **Full Docker Containerization** (with PostgreSQL 16).

### Option A: Local Run (Instant)
```bash
# 1. Install dependencies
npm install

# 2. Compile TypeScript (client + server)
npm run build

# 3. Start the application
npm start
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### Option B: Docker Compose (Production Multi-Stage Build)
```bash
docker-compose up --build
```
This builds the multi-stage Docker container and launches both the EHR web application on port `3000` and the PostgreSQL 16 database on port `5432`.

---

## 🛠️ Architecture & Resume Bullet Breakdown

| Resume Feature | Implementation Architecture | Key Files |
| :--- | :--- | :--- |
| **High-Concurrency Clinical Dashboard** | Dynamic form engine for SOAP notes, appointment lifecycle transit, and live vitals telemetry. | [`src/client/app.ts`](file:///E:/clinical-ehr-portal/src/client/app.ts), [`public/index.html`](file:///E:/clinical-ehr-portal/public/index.html) |
| **Modular UI Services & DI** | Angular-concept hierarchical Dependency Injection container (`AppInjector`) with `@Injectable` singletons. Decouples UI presentation from REST APIs. | [`src/client/core/di-container.ts`](file:///E:/clinical-ehr-portal/src/client/core/di-container.ts), [`src/client/services/`](file:///E:/clinical-ehr-portal/src/client/services) |
| **CSS3 Flexbox / Grid Optimization** | 2D CSS Grid for dashboards, data tables, and vitals cards; 1D Flexbox for navigation and toolbars. Browser containment (`contain: paint layout`) cuts latency. | [`public/styles/grid.css`](file:///E:/clinical-ehr-portal/public/styles/grid.css), [`public/styles/layout.css`](file:///E:/clinical-ehr-portal/public/styles/layout.css) |
| **Validation & Error Boundary across 500+ Requests** | Client-side reactive input validation with physiological safety constraints + global error boundary intercepting anomalies across 500+ concurrent requests. | [`src/client/core/validator.ts`](file:///E:/clinical-ehr-portal/src/client/core/validator.ts), [`src/client/core/error-boundary.ts`](file:///E:/clinical-ehr-portal/src/client/core/error-boundary.ts), [`src/client/services/concurrency.service.ts`](file:///E:/clinical-ehr-portal/src/client/services/concurrency.service.ts) |
| **PostgreSQL & Docker** | Hybrid database layer connecting to PostgreSQL 16 (via `pg.Pool`) with auto-fallback to in-memory store; multi-stage Dockerfile and Docker Compose orchestration. | [`src/server/db.ts`](file:///E:/clinical-ehr-portal/src/server/db.ts), [`Dockerfile`](file:///E:/clinical-ehr-portal/Dockerfile), [`docker-compose.yml`](file:///E:/clinical-ehr-portal/docker-compose.yml), [`sql/init.sql`](file:///E:/clinical-ehr-portal/sql/init.sql) |

---

## 📂 Project Directory Structure

```text
E:\clinical-ehr-portal/
├── Dockerfile                  # Multi-stage production container build
├── docker-compose.yml          # Container orchestration (Web App + PostgreSQL 16)
├── .dockerignore               # Docker build exclusions
├── package.json                # Dependencies and npm build scripts
├── tsconfig.json               # Root TypeScript configuration
├── tsconfig.server.json        # Backend Node/Express TS build config
├── tsconfig.client.json        # Frontend ES2022 browser TS build config
├── sql/
│   └── init.sql                # PostgreSQL relational schema, indexes & seed data
├── public/                     # Compiled frontend assets and markup
│   ├── index.html              # Accessible semantic HTML5 interface
│   ├── styles/
│   │   ├── main.css            # Palette, typography, badges, and toast notifications
│   │   ├── layout.css          # Flexbox application layouts, navigation tabs, and drawers
│   │   ├── grid.css            # CSS3 Grid cards, containment data grid, and vitals cards
│   │   └── components.css      # Modals, form controls, and validation error styling
│   └── js/                     # Compiled browser ES Modules
└── src/
    ├── server/                 # RESTful Backend API
    │   ├── index.ts            # Express server initialization & routing
    │   ├── db.ts               # Resilient hybrid database layer (PostgreSQL + In-Memory fallback)
    │   ├── seedData.ts         # Initial clinical records, appointments, and encounters
    │   └── routes/             # REST route modules
    │       ├── patientRoutes.ts
    │       ├── appointmentRoutes.ts
    │       ├── encounterRoutes.ts
    │       └── simulationRoutes.ts
    └── client/                 # TypeScript Frontend Application (Angular Concepts)
        ├── app.ts              # Root UI controller & lifecycle manager
        ├── core/
        │   ├── di-container.ts # Angular Dependency Injection (DI) Container
        │   ├── validator.ts    # Angular Reactive Forms & Clinical Physiological Validators
        │   ├── error-boundary.ts # Centralized Error Boundary & Telemetry Trapping
        │   └── event-bus.ts    # RxJS-style Observable / Subject state management
        ├── models/             # Strongly typed clinical TypeScript interfaces
        │   ├── patient.model.ts
        │   ├── appointment.model.ts
        │   └── clinical.model.ts
        └── services/           # Injected UI & Business Logic Services
            ├── http.service.ts
            ├── patient.service.ts
            ├── appointment.service.ts
            ├── clinical-form.service.ts
            ├── concurrency.service.ts
            └── notification.service.ts
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Returns service health and active database engine. |
| `GET` | `/api/simulate/stats` | High-level clinical dashboard counters. |
| `GET` | `/api/patients` | Search and filter patients (`?q=query&status=Active`). |
| `GET` | `/api/patients/:id` | Full patient chart with medical history and vitals. |
| `POST` | `/api/patients` | Register a new clinical patient. |
| `GET` | `/api/appointments` | List appointments (`?status=Scheduled`). |
| `POST` | `/api/appointments` | Schedule a new appointment. |
| `PATCH`| `/api/appointments/:id/status` | Update stage: `Scheduled`, `Arrived`, `In-Consultation`, `Completed`. |
| `GET` | `/api/encounters` | List documented SOAP encounters. |
| `POST` | `/api/encounters` | Save clinical documentation with physiological vitals checks. |
| `POST` | `/api/simulate/stress` | Execute 500+ concurrent requests stress test. |


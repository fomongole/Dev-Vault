<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<h1 align="center">DevVault API</h1>

<p align="center">
  A secure, production-ready code snippet manager API built with <strong>NestJS</strong> and <strong>Clean Architecture</strong>.
</p>

<p align="center">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License" />
    <img src="https://img.shields.io/badge/Node.js-20%2B-green.svg" alt="Node.js" />
    <img src="https://img.shields.io/badge/Database-MySQL%20%2F%20TiDB-orange.svg" alt="Database" />
    <img src="https://img.shields.io/badge/Docs-Swagger-brightgreen.svg" alt="Swagger" />
</p>

---

## 📖 Overview

**DevVault** is a robust backend API that functions similarly to GitHub Gists. It allows developers to create, manage, and share code snippets securely. It is engineered with a focus on scalability, security, and maintainability using strict **Clean Architecture** principles.

## ✨ Key Features

- **🔐 Secure Authentication:** JWT-based auth with Passport.js and Bcrypt password hashing.
- **🛡️ Role-Based Access:** - **Public Feed:** Accessible to everyone.
    - **Private Vault:** Users can manage only their own snippets.
    - **Ownership Logic:** You cannot update or delete snippets that don't belong to you.
- **👁️ Visibility Scopes:** Mark snippets as `PUBLIC` (shared with the world) or `PRIVATE` (personal usage).
- **🏷️ Tagging System:** Search and filter snippets by tags (e.g., `react`, `auth`, `algorithm`).
- **⚡ High Performance:** Built on **Fastify** (instead of Express) for low-overhead request processing.
- **🗑️ Soft Deletion:** Data is securely hidden rather than permanently destroyed.
- **📚 OpenAPI/Swagger:** Fully documented API endpoints with interactive UI.

## 🛠️ Tech Stack

- **Framework:** [NestJS](https://nestjs.com/) (Fastify Adapter)
- **Language:** TypeScript
- **Database:** MySQL / TiDB
- **ORM:** TypeORM
- **Validation:** class-validator & class-transformer
- **Containerization:** Docker (for local development)

---

## 📚 API Documentation
-  DevVault includes a fully interactive Swagger UI..
- Start the server.
- Visit http://localhost:3000/api in your browser.

You can test all endpoints (Auth, Snippets, Tags) directly from the interface.
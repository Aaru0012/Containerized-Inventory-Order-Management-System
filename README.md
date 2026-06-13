# Containerized Inventory & Order Management System

![Docker](https://img.shields.io/badge/Docker-Containerized-blue)
![Python](https://img.shields.io/badge/Python-Backend-3776ab)
![React](https://img.shields.io/badge/React-Frontend-61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791)

A full-stack inventory and order management system built with React (frontend), FastAPI (backend), and PostgreSQL, containerized with Docker and Docker Compose.

## Overview

This project provides a simple dashboard to manage products, inventory levels, customers, and orders.

### Key Features

- Manage products: create, update, delete, and list
- Track inventory quantities in real time
- Create and manage customer orders
- RESTful API with JSON responses
- Dockerized frontend, backend, and database services

## Tech Stack

- Frontend: React, Vite, Axios
- Backend: Python, FastAPI, Uvicorn
- Database: PostgreSQL
- Containerization: Docker, Docker Compose

Repository layout

```text
Containerized-Inventory-Order-Management-System/
├── frontend/
├── backend/
├── docker-compose.yml
└── README.md
```

## Prerequisites

- Docker
- Docker Compose
- Git

## Quick Start

1. Clone the repository:

```bash
git clone https://github.com/Aaru0012/Containerized-Inventory-Order-Management-System.git
cd Containerized-Inventory-Order-Management-System
```

2. Create a `.env` file in the project root with the following values (adjust as needed):

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=inventory_db
DATABASE_URL=postgresql://postgres:postgres@db:5432/inventory_db
```

3. Start the application with Docker Compose:

```bash
docker compose up --build
```

The frontend will be available at the address printed by the compose logs and the backend API on the configured port (see `backend/app/main.py`).

### Alternative: Pull pre-built images

```bash
docker pull aryanvermaa/inventory-backend:latest
docker pull aryanvermaa/inventory-frontend:latest
docker compose up
```

## API Endpoints (summary)

- GET `/api/products` — list all products
- POST `/api/products` — create a product
- PUT `/api/products/:id` — update a product
- DELETE `/api/products/:id` — delete a product

Refer to the backend `app` code for full details (see `backend/app/*`).

## Common Docker commands

```bash
docker compose up --build    # build and start services
docker compose down          # stop and remove containers
docker compose logs -f       # stream logs
```

## Contributing

1. Fork the repository
2. Create a descriptive feature branch
3. Make changes and commit
4. Push your branch and open a Pull Request

If you'd like me to push the changes to the origin for you, grant permission and I'll run the git commands.

## How to push this README change locally

Run these commands from the project root to push the update to GitHub:

```bash
git add README.md
git commit -m "docs: improve README content"
git push
```

## License

MIT License

---

Developed by Aaru0012.

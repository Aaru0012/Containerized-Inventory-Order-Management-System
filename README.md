# Containerized Inventory & Order Management System

![Docker](https://img.shields.io/badge/Docker-Containerized-blue)
![Python](https://img.shields.io/badge/Python-Backend-3776ab)
![React](https://img.shields.io/badge/React-Frontend-61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791)

A full-stack inventory and order management system built with React, FastAPI, Python, and PostgreSQL, fully containerized using Docker and Docker Compose.

## Overview

This project helps businesses manage products, inventory, and customer orders through a centralized dashboard.

### Features

- Add, update, delete, and view products
- Track inventory quantities in real time
- Create and manage customer orders
- RESTful API architecture
- Responsive user interface
- Dockerized deployment environment

## Tech Stack

| Layer | Technology |
|---------|------------|
| Frontend | React, Axios, CSS |
| Backend | Python, FastAPI, Uvicorn |
| Database | PostgreSQL |
| Containerization | Docker, Docker Compose |
| Registry | Docker Hub |
```text
Containerized-Inventory-Order-Management-System/
│
├── frontend/
├── backend/
├── docker-compose.yml
└── README.md
```

## Prerequisites

- Docker
- Docker Compose
- Git

## Installation

### Clone Repository

```bash
git clone https://github.com/Aaru0012/Containerized-Inventory-Order-Management-System.git
cd Containerized-Inventory-Order-Management-System
```

### Run with Docker Compose

```bash
docker compose up
```

### Pull Pre-built Images from Docker Hub

```bash
docker pull aryanvermaa/inventory-backend:latest
docker pull aryanvermaa/inventory-frontend:latest
```

## Services

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| PostgreSQL | postgresql://localhost:5432 |
| Docker Hub Backend | https://hub.docker.com/r/aryanvermaa/inventory-backend |
| Docker Hub Frontend | https://hub.docker.com/r/aryanvermaa/inventory-frontend |

## Environment Variables

Create a `.env` file in the root directory:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=inventory_db
DATABASE_URL=postgresql://postgres:postgres@db:5432/inventory_db
```

## API Endpoints

### Products

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/products | Get all products |
| POST | /api/products | Create product |
| PUT | /api/products/:id | Update product |
| DELETE | /api/products/:id | Delete product |

## Docker Commands

```bash
docker compose up --build
docker compose down
docker compose logs -f
```

## Future Enhancements

- User authentication
- Role-based access control
- Analytics dashboard
- Automated testing
- CI/CD pipeline

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push your branch
5. Open a Pull Request

## License

MIT License

## Author

Developed by Aaru0012.

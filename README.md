# Containerized Inventory & Order Management System

![Docker](https://img.shields.io/badge/Docker-Containerized-blue)
![Node.js](https://img.shields.io/badge/Node.js-Backend-green)
![React](https://img.shields.io/badge/React-Frontend-61DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-success)

A full-stack inventory and order management system built with React, Node.js, Express, and MongoDB, fully containerized using Docker and Docker Compose.

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
| Backend | Node.js, Express |
| Database | MongoDB |
| Containerization | Docker, Docker Compose |

## Project Structure

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

### Run with Docker

```bash
docker compose up --build
```

## Services

| Service | URL |
|---------|-----|
| Frontend | https://containerized-inventory-order-manag-orcin.vercel.app/ |
| Backend API | https://containerized-inventory-order-manag-cyan.vercel.app/ |
| MongoDB | mongodb://localhost:27017 |

## Environment Variables

Create a `.env` file inside the backend directory:

```env
MONGO_URI=mongodb://mongo:27017/inventorydb
PORT=5000
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

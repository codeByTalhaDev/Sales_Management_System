# Sales Management System

A full-stack Sales Management System built with React, Node.js, Express, and MySQL.

## Features

- JWT Authentication with OTP verification
- Customer Management
- Supplier Management
- Employee Management
- Product & Category Management
- Unit of Measure (UOM) Management
- Purchase Management
- Inventory & Stock Tracking
- Low Stock & Expiry Alerts
- Dashboard Statistics

## Tech Stack

### Frontend
- React.js
- Vite
- Tailwind CSS
- Axios
- React Router DOM
- React Hot Toast
- Lucide React

### Backend
- Node.js
- Express.js
- Sequelize ORM
- MySQL
- JWT Authentication
- Bcrypt
- Nodemailer

## Project Structure

### Backend Architecture
Route → Validator → Controller → Service → Model

### Folder Structure
sales-management-system/

├── client/                   # React frontend

│   ├── src/

│   ├── .env.example

│   └── Dockerfile

├── server/                   # Node.js backend

│   ├── src/

│   │   ├── config/

│   │   ├── controllers/

│   │   ├── middleware/

│   │   ├── models/

│   │   ├── routes/

│   │   ├── services/

│   │   ├── utils/

│   │   └── validators/

│   ├── .env.example

│   └── Dockerfile

├── docker-compose.yml

└── README.md

## Getting Started

### Prerequisites
- Node.js v18+
- MySQL
- npm

### Installation

#### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/sales-management-system.git
cd sales-management-system
```

#### 2. Setup Server
```bash
cd server
npm install
cp .env.example .env
# Fill in your .env values
npm run dev
```

#### 3. Setup Client
```bash
cd client
npm install
cp .env.example .env
# Fill in your .env values
npm run dev
```

## Environment Variables

Before running the project, create .env files for both the client and server.

# Sample environment files are provided:

client/.env.example

server/.env.example

Open these files, copy their contents into .env files, and update the values according to your setup.


## License
MIT


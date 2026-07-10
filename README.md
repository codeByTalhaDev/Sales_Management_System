# Sales Management System

A full-stack Sales Management System built with React, Node.js, Express, and MySQL. Manage customers, suppliers, employees, products, purchases, and inventory — all in one place.

---

## Features

- JWT Authentication with OTP email verification
- Customer Management
- Supplier Management
- Employee Management
- Product & Category Management
- Unit of Measure (UOM) Management
- Purchase Management with automatic stock update
- Inventory & Stock Tracking
- Low Stock & Expiry Alerts
- Dashboard Statistics

---

## Tech Stack

**Frontend:** React.js, Vite, Tailwind CSS, Axios, React Router DOM

**Backend:** Node.js, Express.js, Sequelize ORM, MySQL, JWT, Bcrypt, Nodemailer

---

## Option 1 — Local Development

**Prerequisites**
- Node.js v20+
- MySQL installed and running

**Server**
```bash
cd server
npm install
cp .env.example .env
# open .env and fill in your values
npm run dev
```

**Client**
```bash
cd client
npm install
cp .env.example .env
# open .env and fill in your values
npm run dev
```

Open: `http://localhost:5173`

---

## Option 2 — Docker (Clone from GitHub)

**Prerequisites**
- Docker Desktop installed and running

```bash
# STEP 1 — Clone
git clone https://github.com/codeByTalhaDev/Sales_Management_System.git
cd Sales_Management_System

# STEP 2 — Create .env
cp .env.example .env
# open .env and fill in your values
# check .env.example for all required variables

# STEP 3 — Run
docker-compose up --build
```

Open: `http://localhost`

```bash
# To stop
docker-compose down
```

---

## Option 3 — Docker Hub (No Cloning Needed)

**Prerequisites**
- Docker Desktop installed and running

```bash
# STEP 1 — Create folder
mkdir sales-app
cd sales-app

# STEP 2 — Create .env file
# check .env.example on GitHub for all required variables

# STEP 3 — Copy docker-compose.hub.yml from this repo into your folder

# STEP 4 — Run
docker-compose -f docker-compose.hub.yml up
```

Open: `http://localhost`

```bash
# To stop
docker-compose down
```

---

## Environment Variables

All required variables are listed in:
- `.env.example` — for Docker
- `server/.env.example` — for server
- `client/.env.example` — for client

> Note: Gmail App Password required for email. Get it from `https://myaccount.google.com/apppasswords`

---

## Docker Commands

```bash
docker-compose up --build   # build and start
docker-compose up -d        # run in background
docker-compose down         # stop
docker-compose down -v      # stop and delete data
docker ps                   # see running containers
docker logs sales_server    # see server logs
docker logs sales_client    # see client logs
docker logs sales_mysql     # see database logs
```

---

## Docker Hub Images

| Image | Link |
|-------|------|
| Server | https://hub.docker.com/r/codebytalhadev/sales-server |
| Client | https://hub.docker.com/r/codebytalhadev/sales-client |

---

## Author

Made by [codeByTalhaDev](https://github.com/codeByTalhaDev)

---

## License

MIT
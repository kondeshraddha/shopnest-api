# 🛒 ShopNest API

Production-grade NestJS E-Commerce REST API

## Tech Stack
- NestJS 10 + TypeScript
- PostgreSQL + Sequelize ORM
- JWT Authentication
- Mock Payment (Razorpay ready)
- Nodemailer + Mailtrap
- Multer + Sharp (image upload)
- Swagger API Docs

## Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/kondeshraddha/shopnest-api.git
cd shopnest-api
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env
# Edit .env with your credentials
```

### 3. Setup Database
```bash
# Create PostgreSQL database
createdb shopnest_db
```

### 4. Run App
```bash
npm run start:dev
```

### 5. Open API Docs
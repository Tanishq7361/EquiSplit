# 💸 EquiSplit - Full Stack Expense Sharing Platform

A production-style **expense sharing platform** inspired by Splitwise, built with **Spring Boot, React, PostgreSQL, JWT Authentication, and Docker**.

EquiSplit enables users to create groups, split expenses using multiple strategies, calculate balances automatically, record settlements, and simplify debts using the **Min Cash Flow Algorithm**.

---

## 🚀 Live Demo

### Frontend
https://equi-split-dbj5pvf6p-tanishq7361s-projects.vercel.app

### Backend API
https://equisplit-dqw0.onrender.com

---

# ✨ Features

## 🔐 Authentication

- User Registration
- User Login
- JWT Authentication
- Secure Password Encryption
- Protected APIs
- Stateless Authentication

---

## 👥 Group Management

- Create Group
- View My Groups
- View Group Details
- Delete Group
- Leave Group
- Transfer Group Ownership
- Role-Based Authorization

---

## 👤 Member Management

- Add Members
- Remove Members
- Owner-only Member Removal
- Prevent Owner Removal
- Prevent Removing Members with Existing Expenses
- Prevent Removing Members with Existing Settlements

---

## 💸 Expense Management

Supports three expense splitting strategies.

### Equal Split

Split expenses equally among all participants.

### Exact Split

Specify the exact amount for every participant.

### Percentage Split

Split expenses based on percentage contribution.

### Expense Features

- Create Expense
- Edit Expense
- Delete Expense
- View Expense Details
- Expense Categories
- Relative Timestamps
- Expand / Collapse Expense Details
- View Split Information

---

## 💰 Balance Calculation

Automatically calculates

- Amount Owed
- Amount Receivable
- Net Balance
- Member-wise Balances

---

## 🤝 Settlement Management

- Record Settlement
- Delete Settlement
- View Settlement History
- Relative Time Display

---

## 🧮 Debt Simplification

Implements the **Min Cash Flow Algorithm** to minimize the total number of transactions required to settle all debts.

### Example

Before Simplification

A ➜ B ₹500

B ➜ C ₹500

After Simplification

A ➜ C ₹500

---

## 📊 Dashboard

Displays

- Total Members
- Total Expenses
- Total Amount Spent
- Outstanding Balances
- Simplified Debts

---

## 🛡 Security

- JWT Authentication
- Spring Security
- Route Protection
- Authorization Checks
- Input Validation
- Business Rule Validation

---

# 🏗 Tech Stack

## Backend

- Java 21
- Spring Boot
- Spring Security
- Spring Data JPA
- Hibernate
- PostgreSQL
- JWT
- Maven

---

## Frontend

- React
- React Router
- Axios
- CSS Modules

---

## DevOps

- Docker
- Render
- Vercel

---

# 🏛 Architecture

```
                React Frontend
                      │
                      │ REST APIs
                      ▼
             Spring Boot Backend
                      │
          Spring Security + JWT
                      │
              Spring Data JPA
                      │
                 PostgreSQL
```

---

# 📂 Project Structure

```
EquiSplit
│
├── backend
│   ├── config
│   ├── controller
│   ├── dto
│   ├── entity
│   ├── repository
│   ├── security
│   ├── service
│   └── exception
│
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── hooks
│   │   ├── services
│   │   ├── context
│   │   └── styles
│
├── docker-compose.yml
│
└── README.md
```

---

# 📌 REST API Modules

## Authentication

- Register
- Login

---

## Groups

- Create Group
- View Groups
- Group Details
- Delete Group
- Leave Group
- Transfer Ownership

---

## Members

- Add Member
- Remove Member

---

## Expenses

- Create Expense
- View Expenses
- Update Expense
- Delete Expense

---

## Settlements

- Create Settlement
- Delete Settlement

---

## Balances

- Member Balances
- Net Balance

---

## Debts

- Simplified Debt Calculation

---

# ⚙ Running Locally

## Clone Repository

```bash
git clone https://github.com/yourusername/EquiSplit.git

cd EquiSplit
```

---

## Backend

```bash
cd backend

mvn spring-boot:run
```

Backend runs on

```
http://localhost:8080
```

---

## Frontend

```bash
cd frontend

npm install

npm start
```

Frontend runs on

```
http://localhost:3000
```

---

## Using Docker

```bash
docker compose up --build
```

---

# 🗄 Database

Database used:

- PostgreSQL

ORM:

- Spring Data JPA
- Hibernate

---

# 🎯 Key Highlights

- Full Stack Web Application
- JWT Authentication
- RESTful API Design
- Spring Security
- Business Rule Validation
- Min Cash Flow Algorithm
- Responsive React UI
- Dockerized Backend
- Cloud Deployment
- Production-style Architecture

---

# 🧠 Algorithms Used

## Min Cash Flow Algorithm

Used to minimize the number of settlement transactions by calculating the optimal payment graph.

Time Complexity

```
O(n²)
```

---

# 🔮 Future Enhancements

- Email Invitations
- OCR Bill Scanning
- Receipt Uploads
- Recurring Expenses
- Multi-Currency Support
- Push Notifications
- Export Reports (PDF/Excel)
- Dark Mode
- Activity Feed
- Redis Caching

---

# 📷 Screenshots

> Add screenshots of:

- Login Page
- Dashboard
- Groups
- Expense List
- Members
- Debt Simplification
- Settlement History

---

# 📈 Skills Demonstrated

- Java
- Spring Boot
- Spring Security
- JWT
- REST APIs
- Hibernate
- PostgreSQL
- React
- Axios
- Docker
- Git
- GitHub
- Render
- Vercel
- MVC Architecture
- Data Structures & Algorithms
- Min Cash Flow Algorithm
- Software Design

---

# 💼 Suitable For

This project demonstrates skills relevant for Software Engineering internships and full-time roles at companies such as:

- Google
- Microsoft
- Amazon
- Meta
- Atlassian
- Adobe
- Salesforce
- Uber
- Flipkart
- Walmart Global Tech

---

## ⭐ If you found this project useful, consider giving it a star!
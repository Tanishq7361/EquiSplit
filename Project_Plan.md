# EquiSplit - Splitwise Clone

## 1. Project Overview

### Goal

Build a production-grade expense-sharing platform similar to Splitwise where users can:

* Create groups
* Add friends
* Record expenses
* Split bills
* Track balances
* Settle debts
* View reports and analytics

The project should demonstrate:

* Java Backend Development
* Spring Boot
* Database Design
* REST API Design
* Authentication & Authorization
* Transaction Management
* Caching
* System Design
* Algorithmic Thinking

---

# 2. Tech Stack

## Backend

* Java 21
* Spring Boot
* Spring Security
* Spring Data JPA
* Hibernate
* PostgreSQL
* Redis
* Maven

## Frontend

* React
* Tailwind CSS

## DevOps

* Docker
* Docker Compose

---

# 3. High Level Architecture

Frontend (React)

↓

REST APIs

↓

Controllers

↓

Services

↓

Repositories

↓

PostgreSQL

↓

Redis Cache

---

# 4. Functional Requirements

## User Management

Users should be able to:

* Register
* Login
* Logout
* View Profile
* Update Profile

---

## Friend Management

Users should be able to:

* Search users
* Send friend request
* Accept friend request
* Reject friend request
* View friend list

---

## Group Management

Users should be able to:

* Create Group
* Update Group
* Delete Group
* Add Members
* Remove Members
* View Group Details

---

## Expense Management

Users should be able to:

* Add Expense
* Edit Expense
* Delete Expense
* View Expense History

Supported expense types:

### Equal Split

Example:

Amount = 4000

Members = 4

Each Share = 1000

---

### Exact Split

Alice = 500

Bob = 1500

Charlie = 2000

---

### Percentage Split

Alice = 50%

Bob = 25%

Charlie = 25%

Validation:

Total Percentage = 100%

---

## Balance Management

System should:

* Calculate balances
* Track who owes whom
* Display outstanding amounts

Example:

Alice paid 4000

Bob owes Alice 1000

Charlie owes Alice 1000

David owes Alice 1000

---

## Settlement Management

Users should be able to:

* Settle balances
* Record payments
* View settlement history

---

# 5. Non Functional Requirements

## Security

* JWT Authentication
* Password Hashing
* Role Based Access

## Performance

* Response time < 200ms for common APIs
* Proper indexing

## Scalability

* Layered Architecture
* Stateless APIs
* Redis Caching

## Reliability

* ACID Transactions
* Proper Exception Handling

---

# 6. Database Design

## users

Fields:

* id
* name
* email
* password_hash
* created_at
* updated_at

---

## friendships

Fields:

* id
* sender_id
* receiver_id
* status
* created_at

Status:

* PENDING
* ACCEPTED
* REJECTED

---

## groups

Fields:

* id
* name
* created_by
* created_at

---

## group_members

Fields:

* id
* group_id
* user_id
* joined_at

---

## expenses

Fields:

* id
* group_id
* paid_by
* amount
* description
* split_type
* created_at

Split Types:

* EQUAL
* EXACT
* PERCENTAGE

---

## expense_splits

Fields:

* id
* expense_id
* user_id
* share_amount

---

## settlements

Fields:

* id
* payer_id
* receiver_id
* amount
* created_at

---

## activities

Fields:

* id
* group_id
* user_id
* activity_type
* description
* created_at

---

# 7. REST API Design

## Authentication APIs

POST /api/auth/register

POST /api/auth/login

POST /api/auth/logout

---

## User APIs

GET /api/users/profile

PUT /api/users/profile

GET /api/users/search

---

## Friend APIs

POST /api/friends/request

POST /api/friends/accept

POST /api/friends/reject

GET /api/friends

---

## Group APIs

POST /api/groups

GET /api/groups

GET /api/groups/{id}

PUT /api/groups/{id}

DELETE /api/groups/{id}

POST /api/groups/{id}/members

DELETE /api/groups/{id}/members

---

## Expense APIs

POST /api/expenses

GET /api/expenses/{id}

PUT /api/expenses/{id}

DELETE /api/expenses/{id}

GET /api/groups/{id}/expenses

---

## Balance APIs

GET /api/groups/{id}/balances

GET /api/users/{id}/balances

---

## Settlement APIs

POST /api/settlements

GET /api/settlements/history

---

# 8. Core Business Logic

## Expense Flow

User Creates Expense

↓

Validate Input

↓

Store Expense

↓

Store Expense Splits

↓

Recalculate Balances

↓

Create Activity Log

↓

Return Response

---

## Settlement Flow

User Records Settlement

↓

Validate Amount

↓

Update Balances

↓

Store Settlement

↓

Create Activity

---

# 9. Debt Simplification Algorithm

Goal:

Minimize number of transactions.

Example:

A owes B 500

B owes C 500

Simplified:

A owes C 500

Approach:

1. Calculate net balance for each user
2. Separate creditors and debtors
3. Use greedy matching
4. Generate minimum transfers

Expected Complexity:

O(N log N)

---

# 10. Caching Strategy

Redis Cache

Cache:

* Group Balances
* Dashboard Data
* User Summary

Pattern:

Cache Aside

Cache Invalidation:

* Expense Created
* Expense Updated
* Settlement Added

---

# 11. Activity Feed

Track:

* Expense Created
* Expense Updated
* Expense Deleted
* Member Added
* Settlement Created

---

# 12. Analytics

Provide:

* Total Spending
* Monthly Spending
* Category Wise Spending
* Top Spender
* Most Active Group

---

# 13. Dockerization

Services:

* Spring Boot
* PostgreSQL
* Redis

Files:

* Dockerfile
* docker-compose.yml

---

# 14. Deployment

Frontend:

* Vercel

Backend:

* Render / Railway / AWS

Database:

* PostgreSQL

---

# 15. Project Development Roadmap

Phase 1

* Database Design
* ER Diagram

Phase 2

* Spring Boot Setup
* PostgreSQL Connection

Phase 3

* Authentication Module

Phase 4

* User Module

Phase 5

* Friend Module

Phase 6

* Group Module

Phase 7

* Expense Module

Phase 8

* Balance Engine

Phase 9

* Settlement Module

Phase 10

* Debt Simplification Algorithm

Phase 11

* Activity Feed

Phase 12

* Redis Integration

Phase 13

* Dockerization

Phase 14

* Deployment

Phase 15

* Testing & Documentation

---

# 16. Resume Impact

Key Concepts Demonstrated:

* Java
* Spring Boot
* REST APIs
* PostgreSQL
* JPA/Hibernate
* Spring Security
* JWT
* Redis
* Docker
* System Design
* Transaction Management
* Caching
* Algorithm Design
* React
* Full Stack Development

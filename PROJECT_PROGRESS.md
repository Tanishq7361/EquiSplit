# EquiSplit - Project Progress

## Project Goal

EquiSplit is a Splitwise-inspired expense sharing application.

Users can:

* Register and login
* Create groups
* Add members to groups
* Add expenses
* Split expenses equally
* View balances
* Record settlements
* View expense history

---

## Tech Stack

### Backend

* Java 21
* Spring Boot
* Spring Security
* JWT Authentication
* Spring Data JPA
* PostgreSQL
* Maven

### Database

PostgreSQL running in Docker

Database Name:

equisplit

---

# Completed Features

## Authentication

### APIs

POST /api/v1/auth/register

POST /api/v1/auth/login

### Status

✅ Complete

### Notes

* JWT token generated on login
* Passwords stored using BCrypt

---

## Groups

### APIs

POST /api/v1/groups

GET /api/v1/groups

### Status

✅ Complete

### Notes

* Group creator automatically becomes OWNER

---

## Group Members

### APIs

POST /api/v1/groups/{groupId}/members

### Status

✅ Complete

### Rules

* Only OWNER can add members
* Duplicate members prevented

---

## Expenses

### APIs

POST /api/v1/groups/{groupId}/expenses

GET /api/v1/groups/{groupId}/expenses

### Status

✅ Complete

### Notes

* Equal split only
* Expense automatically creates ExpenseSplit records

---

## Balances

### APIs

GET /api/v1/groups/{groupId}/expenses/balances

### Status

✅ Complete

### Notes

Balance Formula:

balance = paid - owes + sentSettlements - receivedSettlements

Fixed settlement calculation bug.

---

## Settlements

### APIs

POST /api/v1/groups/{groupId}/settlements

### Status

✅ Complete

### Notes

* Member can settle debts
* Settlements affect balances

---

# Current Test Scenario

Group:

Goa Trip

Members:

* QuantumCoder (OWNER)
* Friend (MEMBER)

Expenses:

* TRAIN = ₹4000
* Hotel Booking = ₹1500
* Bus Ticket = ₹800

Total Expenses:

₹6300

Per Member Share:

₹3150

Settlement Recorded:

Friend → QuantumCoder ₹1000

Current Balances:

QuantumCoder: +₹2150

Friend: -₹2150

---

# Pending Features

## High Priority

* Settlement History API
* Group Members Listing API

## Medium Priority

* Global Exception Handler
* DTO Validation Improvements
* Swagger/OpenAPI Documentation

## Low Priority

* Docker Compose
* Unit Tests
* Integration Tests
* CI/CD

---

# Recent Commits

feat: implement group creation

feat: implement add member to group

feat: implement expense creation and equal split

feat: implement group balance calculation

feat: implement settlements

fix: correct settlement balance calculation

feat: implement expense history endpoint

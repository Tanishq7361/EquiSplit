# EquiSplit Architecture

## Domain Overview

EquiSplit is an expense sharing platform similar to Splitwise.

Users create groups, add members, record expenses, and settle balances.

---

# Entity Relationships

User
│
├── Group (createdBy)
│
├── GroupMember
│
├── Expense (paidBy)
│
├── ExpenseSplit
│
└── Settlement

---

# Database Model

## users

Stores user accounts.

Fields:

* id
* name
* email
* password_hash
* phone_number
* profile_image_url
* default_currency
* is_active
* created_at
* updated_at

---

## groups

Stores expense groups.

Fields:

* id
* name
* description
* created_by
* created_at
* updated_at

Relationship:

groups.created_by → users.id

---

## group_members

Stores group membership.

Fields:

* id
* group_id
* user_id
* role
* joined_at

Role Enum:

OWNER

MEMBER

Relationships:

group_id → groups.id

user_id → users.id

---

## expenses

Stores expenses.

Fields:

* id
* group_id
* paid_by
* amount
* category
* description
* split_type
* created_at

Relationships:

group_id → groups.id

paid_by → users.id

Current Split Type:

EQUAL

---

## expense_splits

Stores how much each member owes.

Fields:

* id
* expense_id
* user_id
* share_amount

Relationships:

expense_id → expenses.id

user_id → users.id

---

## settlements

Stores debt repayments.

Fields:

* id
* group_id
* payer_id
* receiver_id
* amount
* created_at

Relationships:

group_id → groups.id

payer_id → users.id

receiver_id → users.id

---

# Current API Architecture

## Authentication

POST /api/v1/auth/register

POST /api/v1/auth/login

Authentication Method:

JWT Bearer Token

---

## Groups

POST /api/v1/groups

GET /api/v1/groups

POST /api/v1/groups/{groupId}/members

---

## Expenses

POST /api/v1/groups/{groupId}/expenses

GET /api/v1/groups/{groupId}/expenses

GET /api/v1/groups/{groupId}/expenses/balances

---

## Settlements

POST /api/v1/groups/{groupId}/settlements

---

# Balance Calculation

Definitions:

paid =
Total amount paid by user

owes =
Total expense shares assigned to user

sentSettlements =
Money paid during settlements

receivedSettlements =
Money received during settlements

Formula:

balance =
paid

* owes

- sentSettlements

* receivedSettlements

Interpretation:

Positive Balance:

User should receive money

Negative Balance:

User owes money

---

# Package Structure

controller

* AuthController
* GroupController
* ExpenseController
* SettlementController

service

* UserService
* GroupService
* ExpenseService
* SettlementService

service.impl

* UserServiceImpl
* GroupServiceImpl
* ExpenseServiceImpl
* SettlementServiceImpl

repository

* UserRepository
* GroupRepository
* GroupMemberRepository
* ExpenseRepository
* ExpenseSplitRepository
* SettlementRepository

entity

* User
* Group
* GroupMember
* GroupRole
* Expense
* ExpenseSplit
* Settlement

dto

request

* RegisterRequest
* LoginRequest
* CreateGroupRequest
* AddMemberRequest
* CreateExpenseRequest
* CreateSettlementRequest

response

* RegisterResponse
* LoginResponse
* GroupResponse
* GroupSummaryResponse
* ExpenseResponse
* ExpenseSummaryResponse
* BalanceResponse
* SettlementResponse

security

* JwtService
* JwtAuthenticationFilter
* SecurityConfig

---

# Next Architecture Tasks

1. Settlement History Endpoint

GET /groups/{groupId}/settlements

2. Group Members Endpoint

GET /groups/{groupId}/members

3. Global Exception Handling

@ControllerAdvice

4. Swagger Documentation

springdoc-openapi

5. Docker Compose

Backend + PostgreSQL

6. Automated Testing

# EquiSplit Codebase Map

## Controllers

### AuthController

Endpoints:

POST /api/v1/auth/register

POST /api/v1/auth/login

Dependencies:

* UserService

---

### GroupController

Endpoints:

POST /api/v1/groups

GET /api/v1/groups

POST /api/v1/groups/{groupId}/members

Dependencies:

* GroupService

---

### ExpenseController

Endpoints:

POST /api/v1/groups/{groupId}/expenses

GET /api/v1/groups/{groupId}/expenses

GET /api/v1/groups/{groupId}/expenses/balances

Dependencies:

* ExpenseService

---

### SettlementController

Endpoints:

POST /api/v1/groups/{groupId}/settlements

Dependencies:

* SettlementService

---

## Services

### GroupService

Methods:

createGroup()

addMember()

getMyGroups()

---

### ExpenseService

Methods:

createExpense()

getGroupExpenses()

getGroupBalances()

---

### SettlementService

Methods:

createSettlement()

---

## Repositories

UserRepository

Methods:

findByEmail()

existsByEmail()

---

GroupRepository

Methods:

findById()

save()

---

GroupMemberRepository

Methods:

findByGroup()

findByGroupAndUser()

findByUser()

---

ExpenseRepository

Methods:

findByGroup()

---

ExpenseSplitRepository

Methods:

findByExpense()

---

SettlementRepository

Methods:

findByGroup()

---

## Security

JWT Authentication

JwtAuthenticationFilter

JwtService

SecurityConfig

Authenticated APIs require:

Authorization: Bearer <token>

---

## Important Business Rules

Group creator becomes OWNER.

Only OWNER can add members.

Only group members can add expenses.

Expenses are currently split equally.

Settlements reduce outstanding debt.

Positive balance means user should receive money.

Negative balance means user owes money.

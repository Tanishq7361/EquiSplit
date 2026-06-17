# EquiSplit — Frontend

React frontend for the EquiSplit expense-splitting application.

## Tech stack

| Concern          | Tool                  |
|------------------|-----------------------|
| UI               | React 18              |
| Routing          | React Router v6       |
| HTTP             | Axios                 |
| State            | Context API           |
| Styles           | CSS Modules           |
| Forms            | Custom `useForm` hook |
| Validation       | Custom validators     |

## Project structure

```
src/
├── api/              # One file per resource — all Axios calls
│   ├── apiClient.js  # Axios instance + request/response interceptors
│   ├── authApi.js
│   ├── groupsApi.js
│   ├── expensesApi.js
│   └── settlementsApi.js
│
├── context/
│   └── AuthContext.js  # Auth state, login/register/logout
│
├── hooks/
│   ├── useAsync.js   # Generic async state machine
│   └── useForm.js    # Form values, errors, touched, submit
│
├── utils/
│   ├── validators.js  # Pure validation functions
│   └── formatters.js  # Currency, date, initials helpers
│
├── components/
│   ├── common/        # Reusable: Button, Input, Card, Spinner, Alert, Avatar, Badge, Select, EmptyState, ProtectedRoute
│   └── layout/        # AppLayout (sidebar), AuthLayout (split screen)
│
├── features/
│   ├── auth/          # LoginPage, RegisterPage
│   ├── dashboard/     # DashboardPage
│   ├── groups/        # GroupsPage, CreateGroupPage, GroupDetailPage, AddMemberPage
│   ├── expenses/      # CreateExpensePage
│   └── settlements/   # CreateSettlementPage
│
├── styles/
│   └── globals.css   # Design tokens (CSS variables) + base reset
│
├── App.js            # Route definitions
└── index.js          # Entry point
```

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Configure API URL
cp .env.example .env
# Edit REACT_APP_API_URL if your backend runs on a different port

# 3. Start dev server
npm start
```

The app runs at `http://localhost:3000`.

## Backend requirements

Ensure the Spring Boot backend is running and CORS is configured to allow `http://localhost:3000`.

## Key design decisions

- **Feature-based folders** — all files for a feature (page, CSS module, local components) live together.
- **API layer** — UI components never call Axios directly; they go through `src/api/*.js`.
- **`useForm` hook** — centralises form state, touched tracking, and validation; no form library needed.
- **`useAsync` hook** — reusable `{ data, loading, error, execute }` state machine for any async call.
- **CSS Modules** — zero class-name collisions, co-located with components, no runtime overhead.
- **Design tokens** — all colours, spacing, radii, and shadows are CSS custom properties in `globals.css`; theming requires changing one file.

# EquiSplit Database Design

## Overview

EquiSplit stores users, friendships, groups, shared expenses, calculated expense splits, settlements, and activity history. PostgreSQL is the primary relational database. Redis can be used for caching sessions, balances, group summaries, and frequently accessed dashboards.

Common conventions:

- Primary keys use `UUID`.
- Timestamps use `TIMESTAMPTZ`.
- Money values use `NUMERIC(12,2)`.
- Status/type columns use constrained `VARCHAR` values.
- Foreign keys should be indexed.
- Soft deletion can be handled with `deleted_at` where needed.

## Tables

## users

Stores registered application users.

| Column | Data Type | Constraints |
| --- | --- | --- |
| `id` | `UUID` | Primary key |
| `name` | `VARCHAR(120)` | Not null |
| `email` | `VARCHAR(255)` | Not null, unique |
| `password_hash` | `VARCHAR(255)` | Not null |
| `phone_number` | `VARCHAR(30)` | Nullable |
| `profile_image_url` | `TEXT` | Nullable |
| `default_currency` | `CHAR(3)` | Not null, default `'USD'` |
| `is_active` | `BOOLEAN` | Not null, default `TRUE` |
| `created_at` | `TIMESTAMPTZ` | Not null, default `NOW()` |
| `updated_at` | `TIMESTAMPTZ` | Not null, default `NOW()` |

Primary key:

- `PRIMARY KEY (id)`

Indexes:

- `CREATE UNIQUE INDEX ux_users_email ON users (LOWER(email));`
- `CREATE INDEX ix_users_phone_number ON users (phone_number);`

Constraints:

- `email` must be unique case-insensitively.
- `default_currency` must be a valid 3-letter ISO currency code.
- `name` cannot be empty.

## friendships

Stores friend relationships between two users.

| Column | Data Type | Constraints |
| --- | --- | --- |
| `id` | `UUID` | Primary key |
| `requester_id` | `UUID` | Not null, foreign key to `users(id)` |
| `addressee_id` | `UUID` | Not null, foreign key to `users(id)` |
| `status` | `VARCHAR(20)` | Not null |
| `requested_at` | `TIMESTAMPTZ` | Not null, default `NOW()` |
| `responded_at` | `TIMESTAMPTZ` | Nullable |
| `created_at` | `TIMESTAMPTZ` | Not null, default `NOW()` |
| `updated_at` | `TIMESTAMPTZ` | Not null, default `NOW()` |

Primary key:

- `PRIMARY KEY (id)`

Foreign keys:

- `FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE`
- `FOREIGN KEY (addressee_id) REFERENCES users(id) ON DELETE CASCADE`

Indexes:

- `CREATE INDEX ix_friendships_requester_id ON friendships (requester_id);`
- `CREATE INDEX ix_friendships_addressee_id ON friendships (addressee_id);`
- `CREATE INDEX ix_friendships_status ON friendships (status);`
- `CREATE UNIQUE INDEX ux_friendships_pair ON friendships (LEAST(requester_id, addressee_id), GREATEST(requester_id, addressee_id));`

Constraints:

- `status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'BLOCKED')`
- `requester_id <> addressee_id`
- Only one friendship row can exist for the same unordered pair of users.

## groups

Stores expense-sharing groups.

| Column | Data Type | Constraints |
| --- | --- | --- |
| `id` | `UUID` | Primary key |
| `name` | `VARCHAR(150)` | Not null |
| `description` | `TEXT` | Nullable |
| `created_by` | `UUID` | Not null, foreign key to `users(id)` |
| `default_currency` | `CHAR(3)` | Not null, default `'USD'` |
| `image_url` | `TEXT` | Nullable |
| `is_archived` | `BOOLEAN` | Not null, default `FALSE` |
| `created_at` | `TIMESTAMPTZ` | Not null, default `NOW()` |
| `updated_at` | `TIMESTAMPTZ` | Not null, default `NOW()` |
| `deleted_at` | `TIMESTAMPTZ` | Nullable |

Primary key:

- `PRIMARY KEY (id)`

Foreign keys:

- `FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT`

Indexes:

- `CREATE INDEX ix_groups_created_by ON groups (created_by);`
- `CREATE INDEX ix_groups_name ON groups (name);`
- `CREATE INDEX ix_groups_active ON groups (id) WHERE deleted_at IS NULL;`

Constraints:

- `name` cannot be empty.
- `default_currency` must be a valid 3-letter ISO currency code.

## group_members

Stores membership of users inside groups.

| Column | Data Type | Constraints |
| --- | --- | --- |
| `id` | `UUID` | Primary key |
| `group_id` | `UUID` | Not null, foreign key to `groups(id)` |
| `user_id` | `UUID` | Not null, foreign key to `users(id)` |
| `role` | `VARCHAR(20)` | Not null, default `'MEMBER'` |
| `joined_at` | `TIMESTAMPTZ` | Not null, default `NOW()` |
| `left_at` | `TIMESTAMPTZ` | Nullable |
| `created_at` | `TIMESTAMPTZ` | Not null, default `NOW()` |
| `updated_at` | `TIMESTAMPTZ` | Not null, default `NOW()` |

Primary key:

- `PRIMARY KEY (id)`

Foreign keys:

- `FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE`
- `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`

Indexes:

- `CREATE INDEX ix_group_members_group_id ON group_members (group_id);`
- `CREATE INDEX ix_group_members_user_id ON group_members (user_id);`
- `CREATE INDEX ix_group_members_active ON group_members (group_id, user_id) WHERE left_at IS NULL;`
- `CREATE UNIQUE INDEX ux_group_members_group_user ON group_members (group_id, user_id);`

Constraints:

- `role IN ('OWNER', 'ADMIN', 'MEMBER')`
- A user can have only one membership row per group.

## expenses

Stores expenses paid by a user and optionally associated with a group.

| Column | Data Type | Constraints |
| --- | --- | --- |
| `id` | `UUID` | Primary key |
| `group_id` | `UUID` | Nullable, foreign key to `groups(id)` |
| `paid_by` | `UUID` | Not null, foreign key to `users(id)` |
| `created_by` | `UUID` | Not null, foreign key to `users(id)` |
| `title` | `VARCHAR(180)` | Not null |
| `description` | `TEXT` | Nullable |
| `amount` | `NUMERIC(12,2)` | Not null |
| `currency` | `CHAR(3)` | Not null |
| `split_type` | `VARCHAR(30)` | Not null |
| `expense_date` | `DATE` | Not null |
| `receipt_url` | `TEXT` | Nullable |
| `is_deleted` | `BOOLEAN` | Not null, default `FALSE` |
| `created_at` | `TIMESTAMPTZ` | Not null, default `NOW()` |
| `updated_at` | `TIMESTAMPTZ` | Not null, default `NOW()` |

Primary key:

- `PRIMARY KEY (id)`

Foreign keys:

- `FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL`
- `FOREIGN KEY (paid_by) REFERENCES users(id) ON DELETE RESTRICT`
- `FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT`

Indexes:

- `CREATE INDEX ix_expenses_group_id ON expenses (group_id);`
- `CREATE INDEX ix_expenses_paid_by ON expenses (paid_by);`
- `CREATE INDEX ix_expenses_created_by ON expenses (created_by);`
- `CREATE INDEX ix_expenses_expense_date ON expenses (expense_date);`
- `CREATE INDEX ix_expenses_group_date ON expenses (group_id, expense_date DESC);`
- `CREATE INDEX ix_expenses_active ON expenses (id) WHERE is_deleted = FALSE;`

Constraints:

- `amount > 0`
- `currency` must be a valid 3-letter ISO currency code.
- `split_type IN ('EQUAL', 'EXACT', 'PERCENTAGE', 'SHARES')`
- `title` cannot be empty.

## expense_splits

Stores each participant's owed share for an expense.

| Column | Data Type | Constraints |
| --- | --- | --- |
| `id` | `UUID` | Primary key |
| `expense_id` | `UUID` | Not null, foreign key to `expenses(id)` |
| `user_id` | `UUID` | Not null, foreign key to `users(id)` |
| `owed_amount` | `NUMERIC(12,2)` | Not null |
| `paid_share` | `NUMERIC(12,2)` | Not null, default `0.00` |
| `percentage` | `NUMERIC(5,2)` | Nullable |
| `shares` | `INTEGER` | Nullable |
| `is_settled` | `BOOLEAN` | Not null, default `FALSE` |
| `created_at` | `TIMESTAMPTZ` | Not null, default `NOW()` |
| `updated_at` | `TIMESTAMPTZ` | Not null, default `NOW()` |

Primary key:

- `PRIMARY KEY (id)`

Foreign keys:

- `FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE`
- `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT`

Indexes:

- `CREATE INDEX ix_expense_splits_expense_id ON expense_splits (expense_id);`
- `CREATE INDEX ix_expense_splits_user_id ON expense_splits (user_id);`
- `CREATE INDEX ix_expense_splits_user_settled ON expense_splits (user_id, is_settled);`
- `CREATE UNIQUE INDEX ux_expense_splits_expense_user ON expense_splits (expense_id, user_id);`

Constraints:

- `owed_amount >= 0`
- `paid_share >= 0`
- `percentage IS NULL OR percentage >= 0`
- `shares IS NULL OR shares > 0`
- A user can have only one split row per expense.
- For each expense, the sum of `owed_amount` should equal `expenses.amount`. This should be enforced in application logic or with a deferred trigger.

## settlements

Stores payments made between users to settle balances.

| Column | Data Type | Constraints |
| --- | --- | --- |
| `id` | `UUID` | Primary key |
| `group_id` | `UUID` | Nullable, foreign key to `groups(id)` |
| `payer_id` | `UUID` | Not null, foreign key to `users(id)` |
| `payee_id` | `UUID` | Not null, foreign key to `users(id)` |
| `amount` | `NUMERIC(12,2)` | Not null |
| `currency` | `CHAR(3)` | Not null |
| `status` | `VARCHAR(20)` | Not null |
| `settled_at` | `TIMESTAMPTZ` | Nullable |
| `note` | `TEXT` | Nullable |
| `created_by` | `UUID` | Not null, foreign key to `users(id)` |
| `created_at` | `TIMESTAMPTZ` | Not null, default `NOW()` |
| `updated_at` | `TIMESTAMPTZ` | Not null, default `NOW()` |

Primary key:

- `PRIMARY KEY (id)`

Foreign keys:

- `FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL`
- `FOREIGN KEY (payer_id) REFERENCES users(id) ON DELETE RESTRICT`
- `FOREIGN KEY (payee_id) REFERENCES users(id) ON DELETE RESTRICT`
- `FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT`

Indexes:

- `CREATE INDEX ix_settlements_group_id ON settlements (group_id);`
- `CREATE INDEX ix_settlements_payer_id ON settlements (payer_id);`
- `CREATE INDEX ix_settlements_payee_id ON settlements (payee_id);`
- `CREATE INDEX ix_settlements_created_by ON settlements (created_by);`
- `CREATE INDEX ix_settlements_status ON settlements (status);`
- `CREATE INDEX ix_settlements_pair ON settlements (payer_id, payee_id);`

Constraints:

- `amount > 0`
- `currency` must be a valid 3-letter ISO currency code.
- `status IN ('PENDING', 'COMPLETED', 'CANCELLED')`
- `payer_id <> payee_id`

## activities

Stores audit and activity feed events.

| Column | Data Type | Constraints |
| --- | --- | --- |
| `id` | `UUID` | Primary key |
| `actor_id` | `UUID` | Nullable, foreign key to `users(id)` |
| `group_id` | `UUID` | Nullable, foreign key to `groups(id)` |
| `entity_type` | `VARCHAR(40)` | Not null |
| `entity_id` | `UUID` | Nullable |
| `activity_type` | `VARCHAR(60)` | Not null |
| `message` | `TEXT` | Not null |
| `metadata` | `JSONB` | Not null, default `'{}'::jsonb` |
| `created_at` | `TIMESTAMPTZ` | Not null, default `NOW()` |

Primary key:

- `PRIMARY KEY (id)`

Foreign keys:

- `FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL`
- `FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE`

Indexes:

- `CREATE INDEX ix_activities_actor_id ON activities (actor_id);`
- `CREATE INDEX ix_activities_group_id ON activities (group_id);`
- `CREATE INDEX ix_activities_entity ON activities (entity_type, entity_id);`
- `CREATE INDEX ix_activities_activity_type ON activities (activity_type);`
- `CREATE INDEX ix_activities_created_at ON activities (created_at DESC);`
- `CREATE INDEX ix_activities_metadata ON activities USING GIN (metadata);`

Constraints:

- `entity_type IN ('USER', 'FRIENDSHIP', 'GROUP', 'EXPENSE', 'SETTLEMENT')`
- `message` cannot be empty.

## Relationships

## Users and Friendships

- A user can send many friendship requests.
- A user can receive many friendship requests.
- A friendship connects exactly two different users.
- The unordered pair uniqueness constraint prevents duplicate friendships like `A -> B` and `B -> A`.

## Users and Groups

- A user can create many groups through `groups.created_by`.
- A group has one creator.
- Users join groups through `group_members`.
- A group can have many members.
- A user can belong to many groups.
- `group_members` is the many-to-many join table between `users` and `groups`.

## Groups and Expenses

- A group can have many expenses.
- An expense can belong to one group or be a direct non-group expense.
- If a group is deleted, existing expenses keep their history with `group_id` set to `NULL`.

## Users and Expenses

- `expenses.paid_by` identifies the user who paid the expense.
- `expenses.created_by` identifies the user who entered the expense.
- A user can pay many expenses.
- A user can create many expenses.

## Expenses and Expense Splits

- An expense has many split rows.
- Each split row belongs to one user.
- Each user can have only one split row per expense.
- The sum of all `expense_splits.owed_amount` rows for an expense should equal `expenses.amount`.
- The payer is usually included in `expense_splits` so balances can be calculated consistently.

## Users and Settlements

- A settlement records money transferred from `payer_id` to `payee_id`.
- A user can make many settlements as payer.
- A user can receive many settlements as payee.
- `payer_id` and `payee_id` must be different users.
- A settlement can optionally be attached to a group.

## Activities

- Activities are feed and audit records for user-visible events.
- An activity can be associated with an actor, a group, and a target entity.
- `entity_type` and `entity_id` allow activities to reference different domain objects without separate activity tables.
- `metadata` stores structured event details such as previous values, new values, split summaries, or settlement references.

## Balance Calculation Notes

- Expenses create obligations through `expense_splits`.
- Settlements reduce outstanding balances between users.
- For each expense:
  - The payer is credited by the expense amount they paid.
  - Each participant is debited by their `owed_amount`.
- Net balances can be computed by aggregating expense splits and settlements by user pair, optionally scoped to a group.
- Cached balance summaries may be stored in Redis, but PostgreSQL remains the source of truth.

DROP TABLE IF EXISTS expense_splits CASCADE;
DROP TABLE IF EXISTS settlements CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS group_members CASCADE;
DROP TABLE IF EXISTS friendships CASCADE;
DROP TABLE IF EXISTS groups CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =====================================================
-- USERS
-- =====================================================

CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    name VARCHAR(120) NOT NULL,

    email VARCHAR(255) NOT NULL UNIQUE,

    password_hash VARCHAR(255) NOT NULL,

    phone_number VARCHAR(30),

    profile_image_url TEXT,

    default_currency VARCHAR(3),

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- FRIENDSHIPS
-- =====================================================

CREATE TABLE friendships (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    requester_id BIGINT NOT NULL,

    addressee_id BIGINT NOT NULL,

    status VARCHAR(20) NOT NULL,

    requested_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    responded_at TIMESTAMPTZ,

    CONSTRAINT fk_friendships_requester
        FOREIGN KEY (requester_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_friendships_addressee
        FOREIGN KEY (addressee_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_friendship_pair
        UNIQUE (requester_id, addressee_id),

    CONSTRAINT chk_no_self_friendship
        CHECK (requester_id <> addressee_id)
);

-- =====================================================
-- GROUPS
-- =====================================================

CREATE TABLE groups (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    name VARCHAR(150) NOT NULL,

    created_by BIGINT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_groups_created_by
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE RESTRICT
);

-- =====================================================
-- GROUP MEMBERS
-- =====================================================

CREATE TABLE group_members (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    group_id BIGINT NOT NULL,

    user_id BIGINT NOT NULL,

    joined_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_group_members_group
        FOREIGN KEY (group_id)
        REFERENCES groups(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_group_members_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_group_member
        UNIQUE (group_id, user_id)
);

-- =====================================================
-- EXPENSES
-- =====================================================

CREATE TABLE expenses (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    group_id BIGINT NOT NULL,

    paid_by BIGINT NOT NULL,

    amount DECIMAL(12,2) NOT NULL,

    category VARCHAR(50) NOT NULL,

    description TEXT,

    split_type VARCHAR(20) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_expenses_group
        FOREIGN KEY (group_id)
        REFERENCES groups(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_expenses_paid_by
        FOREIGN KEY (paid_by)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_expense_amount
        CHECK (amount > 0)
);

-- =====================================================
-- EXPENSE SPLITS
-- =====================================================

CREATE TABLE expense_splits (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    expense_id BIGINT NOT NULL,

    user_id BIGINT NOT NULL,

    share_amount DECIMAL(12,2) NOT NULL,

    CONSTRAINT fk_expense_splits_expense
        FOREIGN KEY (expense_id)
        REFERENCES expenses(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_expense_splits_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_expense_split
        UNIQUE (expense_id, user_id),

    CONSTRAINT chk_share_amount
        CHECK (share_amount >= 0)
);

-- =====================================================
-- SETTLEMENTS
-- =====================================================

CREATE TABLE settlements (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    group_id BIGINT NOT NULL,

    payer_id BIGINT NOT NULL,

    receiver_id BIGINT NOT NULL,

    amount DECIMAL(12,2) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_settlements_group
        FOREIGN KEY (group_id)
        REFERENCES groups(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_settlements_payer
        FOREIGN KEY (payer_id)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_settlements_receiver
        FOREIGN KEY (receiver_id)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_settlement_amount
        CHECK (amount > 0),

    CONSTRAINT chk_no_self_settlement
        CHECK (payer_id <> receiver_id)
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_group_members_user
    ON group_members(user_id);

CREATE INDEX idx_group_members_group
    ON group_members(group_id);

CREATE INDEX idx_expenses_group
    ON expenses(group_id);

CREATE INDEX idx_expenses_paid_by
    ON expenses(paid_by);

CREATE INDEX idx_expense_splits_expense
    ON expense_splits(expense_id);

CREATE INDEX idx_expense_splits_user
    ON expense_splits(user_id);

CREATE INDEX idx_settlements_group
    ON settlements(group_id);

CREATE INDEX idx_settlements_payer
    ON settlements(payer_id);

CREATE INDEX idx_settlements_receiver
    ON settlements(receiver_id);

CREATE INDEX idx_friendships_requester
    ON friendships(requester_id);

CREATE INDEX idx_friendships_addressee
    ON friendships(addressee_id);
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(120) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(30),
    profile_image_url TEXT,
    default_currency CHAR(3) NOT NULL DEFAULT 'USD',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT ck_users_name_not_empty CHECK (BTRIM(name) <> ''),
    CONSTRAINT ck_users_default_currency CHECK (default_currency ~ '^[A-Z]{3}$')
);

CREATE TABLE friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL,
    addressee_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_friendships_requester
        FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_friendships_addressee
        FOREIGN KEY (addressee_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT ck_friendships_status
        CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'BLOCKED')),
    CONSTRAINT ck_friendships_different_users CHECK (requester_id <> addressee_id)
);

CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    description TEXT,
    created_by UUID NOT NULL,
    default_currency CHAR(3) NOT NULL DEFAULT 'USD',
    image_url TEXT,
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT fk_groups_created_by
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT ck_groups_name_not_empty CHECK (BTRIM(name) <> ''),
    CONSTRAINT ck_groups_default_currency CHECK (default_currency ~ '^[A-Z]{3}$')
);

CREATE TABLE group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL,
    user_id UUID NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'MEMBER',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    left_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_group_members_group
        FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    CONSTRAINT fk_group_members_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT ck_group_members_role CHECK (role IN ('OWNER', 'ADMIN', 'MEMBER'))
);

CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID,
    paid_by UUID NOT NULL,
    created_by UUID NOT NULL,
    title VARCHAR(180) NOT NULL,
    description TEXT,
    amount NUMERIC(12,2) NOT NULL,
    currency CHAR(3) NOT NULL,
    split_type VARCHAR(30) NOT NULL,
    expense_date DATE NOT NULL,
    receipt_url TEXT,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_expenses_group
        FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL,
    CONSTRAINT fk_expenses_paid_by
        FOREIGN KEY (paid_by) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_expenses_created_by
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT ck_expenses_title_not_empty CHECK (BTRIM(title) <> ''),
    CONSTRAINT ck_expenses_amount_positive CHECK (amount > 0),
    CONSTRAINT ck_expenses_currency CHECK (currency ~ '^[A-Z]{3}$'),
    CONSTRAINT ck_expenses_split_type
        CHECK (split_type IN ('EQUAL', 'EXACT', 'PERCENTAGE', 'SHARES'))
);

CREATE TABLE expense_splits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_id UUID NOT NULL,
    user_id UUID NOT NULL,
    owed_amount NUMERIC(12,2) NOT NULL,
    paid_share NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    percentage NUMERIC(5,2),
    shares INTEGER,
    is_settled BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_expense_splits_expense
        FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE,
    CONSTRAINT fk_expense_splits_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT ck_expense_splits_owed_amount CHECK (owed_amount >= 0),
    CONSTRAINT ck_expense_splits_paid_share CHECK (paid_share >= 0),
    CONSTRAINT ck_expense_splits_percentage CHECK (percentage IS NULL OR percentage >= 0),
    CONSTRAINT ck_expense_splits_shares CHECK (shares IS NULL OR shares > 0)
);

CREATE TABLE settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID,
    payer_id UUID NOT NULL,
    payee_id UUID NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    currency CHAR(3) NOT NULL,
    status VARCHAR(20) NOT NULL,
    settled_at TIMESTAMPTZ,
    note TEXT,
    created_by UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_settlements_group
        FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL,
    CONSTRAINT fk_settlements_payer
        FOREIGN KEY (payer_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_settlements_payee
        FOREIGN KEY (payee_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_settlements_created_by
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT ck_settlements_amount_positive CHECK (amount > 0),
    CONSTRAINT ck_settlements_currency CHECK (currency ~ '^[A-Z]{3}$'),
    CONSTRAINT ck_settlements_status CHECK (status IN ('PENDING', 'COMPLETED', 'CANCELLED')),
    CONSTRAINT ck_settlements_different_users CHECK (payer_id <> payee_id)
);

CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID,
    group_id UUID,
    entity_type VARCHAR(40) NOT NULL,
    entity_id UUID,
    activity_type VARCHAR(60) NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_activities_actor
        FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_activities_group
        FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    CONSTRAINT ck_activities_entity_type
        CHECK (entity_type IN ('USER', 'FRIENDSHIP', 'GROUP', 'EXPENSE', 'SETTLEMENT')),
    CONSTRAINT ck_activities_message_not_empty CHECK (BTRIM(message) <> '')
);

CREATE UNIQUE INDEX ux_users_email ON users (LOWER(email));
CREATE INDEX ix_users_phone_number ON users (phone_number);

CREATE INDEX ix_friendships_requester_id ON friendships (requester_id);
CREATE INDEX ix_friendships_addressee_id ON friendships (addressee_id);
CREATE INDEX ix_friendships_status ON friendships (status);
CREATE UNIQUE INDEX ux_friendships_pair
    ON friendships (LEAST(requester_id, addressee_id), GREATEST(requester_id, addressee_id));

CREATE INDEX ix_groups_created_by ON groups (created_by);
CREATE INDEX ix_groups_name ON groups (name);
CREATE INDEX ix_groups_active ON groups (id) WHERE deleted_at IS NULL;

CREATE INDEX ix_group_members_group_id ON group_members (group_id);
CREATE INDEX ix_group_members_user_id ON group_members (user_id);
CREATE INDEX ix_group_members_active ON group_members (group_id, user_id) WHERE left_at IS NULL;
CREATE UNIQUE INDEX ux_group_members_group_user ON group_members (group_id, user_id);

CREATE INDEX ix_expenses_group_id ON expenses (group_id);
CREATE INDEX ix_expenses_paid_by ON expenses (paid_by);
CREATE INDEX ix_expenses_created_by ON expenses (created_by);
CREATE INDEX ix_expenses_expense_date ON expenses (expense_date);
CREATE INDEX ix_expenses_group_date ON expenses (group_id, expense_date DESC);
CREATE INDEX ix_expenses_active ON expenses (id) WHERE is_deleted = FALSE;

CREATE INDEX ix_expense_splits_expense_id ON expense_splits (expense_id);
CREATE INDEX ix_expense_splits_user_id ON expense_splits (user_id);
CREATE INDEX ix_expense_splits_user_settled ON expense_splits (user_id, is_settled);
CREATE UNIQUE INDEX ux_expense_splits_expense_user ON expense_splits (expense_id, user_id);

CREATE INDEX ix_settlements_group_id ON settlements (group_id);
CREATE INDEX ix_settlements_payer_id ON settlements (payer_id);
CREATE INDEX ix_settlements_payee_id ON settlements (payee_id);
CREATE INDEX ix_settlements_created_by ON settlements (created_by);
CREATE INDEX ix_settlements_status ON settlements (status);
CREATE INDEX ix_settlements_pair ON settlements (payer_id, payee_id);

CREATE INDEX ix_activities_actor_id ON activities (actor_id);
CREATE INDEX ix_activities_group_id ON activities (group_id);
CREATE INDEX ix_activities_entity ON activities (entity_type, entity_id);
CREATE INDEX ix_activities_activity_type ON activities (activity_type);
CREATE INDEX ix_activities_created_at ON activities (created_at DESC);
CREATE INDEX ix_activities_metadata ON activities USING GIN (metadata);

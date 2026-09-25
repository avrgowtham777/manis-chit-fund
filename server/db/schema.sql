-- users: id, member_id (nullable, links to members), username, password_hash, role ('admin'/'member'), active (1/0), created_at, updated_at
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT CHECK(role IN ('admin', 'member')) NOT NULL,
    active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(member_id) REFERENCES members(id)
);

-- chit_settings
CREATE TABLE IF NOT EXISTS chit_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    chit_value INTEGER NOT NULL,
    duration INTEGER NOT NULL,
    pre_lift_payment INTEGER NOT NULL,
    post_lift_payment INTEGER NOT NULL,
    start_month TEXT NOT NULL,
    start_year INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- months
CREATE TABLE IF NOT EXISTS months (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    month_number INTEGER NOT NULL,
    month_label TEXT NOT NULL,
    calendar_month TEXT NOT NULL,
    receivable_amount INTEGER NOT NULL,
    lifted_by_member_id INTEGER,
    lift_date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(lifted_by_member_id) REFERENCES members(id)
);

-- members
CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    phone TEXT,
    status TEXT CHECK(status IN ('active', 'archived')) DEFAULT 'active',
    lift_status TEXT CHECK(lift_status IN ('not_lifted', 'lifted')) DEFAULT 'not_lifted',
    lift_month_id INTEGER,
    lift_date TEXT,
    receivable_amount INTEGER,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(lift_month_id) REFERENCES months(id)
);

-- payments
CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    month_id INTEGER NOT NULL,
    amount_due INTEGER NOT NULL,
    amount_paid INTEGER DEFAULT 0,
    remaining_amount INTEGER NOT NULL,
    payment_date TEXT,
    payment_method TEXT CHECK(payment_method IN ('cash', 'upi', 'bank_transfer', 'other')),
    transaction_reference TEXT,
    receipt_number TEXT,
    status TEXT CHECK(status IN ('paid', 'partial', 'pending')) DEFAULT 'pending',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(member_id) REFERENCES members(id),
    FOREIGN KEY(month_id) REFERENCES months(id)
);

-- notifications
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT CHECK(type IN ('payment', 'lift', 'general', 'system')) NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(member_id) REFERENCES members(id)
);

-- audit_logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id INTEGER,
    old_value TEXT,
    new_value TEXT,
    reason TEXT,
    ip_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_member_id ON users(member_id);
CREATE INDEX IF NOT EXISTS idx_months_lifted_by_member_id ON months(lifted_by_member_id);
CREATE INDEX IF NOT EXISTS idx_members_lift_month_id ON members(lift_month_id);
CREATE INDEX IF NOT EXISTS idx_payments_member_id ON payments(member_id);
CREATE INDEX IF NOT EXISTS idx_payments_month_id ON payments(month_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_notifications_member_id ON notifications(member_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);

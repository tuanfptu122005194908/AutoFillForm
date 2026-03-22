-- ============================================================
-- AutoFillForm Database Schema
-- ============================================================

-- I. ENUM Types
CREATE TYPE user_role     AS ENUM ('USER', 'ADMIN');
CREATE TYPE user_status   AS ENUM ('active', 'blocked');
CREATE TYPE order_status  AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'confirmed', 'failed');
CREATE TYPE payment_method AS ENUM ('manual', 'auto');
CREATE TYPE txn_type      AS ENUM ('credit', 'debit');
CREATE TYPE history_status AS ENUM ('success', 'failed', 'blocked');

-- II. Tables

-- 1. Users
CREATE TABLE users (
    user_id         SERIAL          NOT NULL,
    auth_uid        UUID            UNIQUE,
    email           VARCHAR(255)    NOT NULL UNIQUE,
    password_hash   VARCHAR(255)    NOT NULL DEFAULT '',
    role            user_role       NOT NULL DEFAULT 'USER',
    status          user_status     NOT NULL DEFAULT 'active',
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id)
);

-- 2. User_Profile
CREATE TABLE user_profile (
    profile_id      SERIAL          NOT NULL,
    user_id         INT             NOT NULL UNIQUE,
    full_name       VARCHAR(255)    NOT NULL,
    phone           VARCHAR(20)     DEFAULT NULL,
    avatar_url      VARCHAR(500)    DEFAULT NULL,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (profile_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 3. User_Wallet
CREATE TABLE user_wallet (
    wallet_id           SERIAL  NOT NULL,
    user_id             INT     NOT NULL UNIQUE,
    form_balance        INT     NOT NULL DEFAULT 0,
    total_forms_added   INT     NOT NULL DEFAULT 0,
    total_forms_used    INT     NOT NULL DEFAULT 0,
    last_updated        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (wallet_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT chk_balance CHECK (form_balance >= 0)
);

-- 4. Orders
CREATE TABLE orders (
    order_id            SERIAL              NOT NULL,
    user_id             INT                 NOT NULL,
    amount_vnd          NUMERIC(15, 2)      NOT NULL,
    forms_to_add        INT                 NOT NULL,
    transfer_content    VARCHAR(100)        NOT NULL UNIQUE,
    status              order_status        NOT NULL DEFAULT 'pending',
    note                TEXT                DEFAULT NULL,
    created_at          TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (order_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    CONSTRAINT chk_amount CHECK (amount_vnd > 0),
    CONSTRAINT chk_forms  CHECK (forms_to_add > 0)
);

-- 5. Payments
CREATE TABLE payments (
    payment_id          SERIAL          NOT NULL,
    order_id            INT             NOT NULL UNIQUE,
    bank_account_no     VARCHAR(50)     NOT NULL,
    bank_account_name   VARCHAR(255)    NOT NULL,
    bank_name           VARCHAR(100)    NOT NULL,
    amount_vnd          NUMERIC(15, 2)  NOT NULL,
    transfer_content    VARCHAR(100)    NOT NULL,
    qr_code_url         VARCHAR(500)    DEFAULT NULL,
    method              payment_method  NOT NULL DEFAULT 'manual',
    paid_at             TIMESTAMP       DEFAULT NULL,
    confirmed_by        INT             DEFAULT NULL,
    confirmed_at        TIMESTAMP       DEFAULT NULL,
    status              payment_status  NOT NULL DEFAULT 'pending',
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (payment_id),
    FOREIGN KEY (order_id)     REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (confirmed_by) REFERENCES users(user_id)  ON DELETE SET NULL
);

-- 6. Transactions
CREATE TABLE transactions (
    txn_id          SERIAL      NOT NULL,
    user_id         INT         NOT NULL,
    order_id        INT         DEFAULT NULL,
    type            txn_type    NOT NULL,
    amount          INT         NOT NULL,
    balance_before  INT         NOT NULL,
    balance_after   INT         NOT NULL,
    description     VARCHAR(500) DEFAULT NULL,
    created_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (txn_id),
    FOREIGN KEY (user_id)  REFERENCES users(user_id)   ON DELETE RESTRICT,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE SET NULL
);

-- 7. Form_History
CREATE TABLE form_history (
    history_id      SERIAL          NOT NULL,
    user_id         INT             NOT NULL,
    txn_id          INT             DEFAULT NULL,
    tool_name       VARCHAR(100)    DEFAULT NULL,
    form_url        TEXT            DEFAULT NULL,
    ip_address      VARCHAR(45)     DEFAULT NULL,
    status          history_status  NOT NULL DEFAULT 'success',
    error_message   TEXT            DEFAULT NULL,
    ran_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (history_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)        ON DELETE RESTRICT,
    FOREIGN KEY (txn_id)  REFERENCES transactions(txn_id)  ON DELETE SET NULL
);

CREATE INDEX idx_form_history_user ON form_history(user_id, ran_at DESC);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_wallet ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_history ENABLE ROW LEVEL SECURITY;

-- Users: own row or admin
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid() = auth_uid);
CREATE POLICY "Admin can view all users" ON users
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users u WHERE u.auth_uid = auth.uid() AND u.role = 'ADMIN')
    );
CREATE POLICY "Admin can update users" ON users
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM users u WHERE u.auth_uid = auth.uid() AND u.role = 'ADMIN')
    );

-- User_Profile: own or admin
CREATE POLICY "Profile owner can view" ON user_profile
    FOR SELECT USING (user_id IN (SELECT user_id FROM users WHERE auth_uid = auth.uid()));
CREATE POLICY "Profile owner can update" ON user_profile
    FOR UPDATE USING (user_id IN (SELECT user_id FROM users WHERE auth_uid = auth.uid()));
CREATE POLICY "Admin can view all profiles" ON user_profile
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users u WHERE u.auth_uid = auth.uid() AND u.role = 'ADMIN')
    );

-- User_Wallet: own or admin
CREATE POLICY "Wallet owner can view" ON user_wallet
    FOR SELECT USING (user_id IN (SELECT user_id FROM users WHERE auth_uid = auth.uid()));
CREATE POLICY "Admin can view all wallets" ON user_wallet
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users u WHERE u.auth_uid = auth.uid() AND u.role = 'ADMIN')
    );
CREATE POLICY "Admin can update wallets" ON user_wallet
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM users u WHERE u.auth_uid = auth.uid() AND u.role = 'ADMIN')
    );

-- Orders: own or admin
CREATE POLICY "User can view own orders" ON orders
    FOR SELECT USING (user_id IN (SELECT user_id FROM users WHERE auth_uid = auth.uid()));
CREATE POLICY "User can insert own orders" ON orders
    FOR INSERT WITH CHECK (user_id IN (SELECT user_id FROM users WHERE auth_uid = auth.uid()));
CREATE POLICY "Admin can view all orders" ON orders
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users u WHERE u.auth_uid = auth.uid() AND u.role = 'ADMIN')
    );

-- Payments: via order ownership or admin
CREATE POLICY "User can view own payments" ON payments
    FOR SELECT USING (
        order_id IN (SELECT order_id FROM orders WHERE user_id IN (SELECT user_id FROM users WHERE auth_uid = auth.uid()))
    );
CREATE POLICY "User can insert own payments" ON payments
    FOR INSERT WITH CHECK (
        order_id IN (SELECT order_id FROM orders WHERE user_id IN (SELECT user_id FROM users WHERE auth_uid = auth.uid()))
    );
CREATE POLICY "Admin can manage all payments" ON payments
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users u WHERE u.auth_uid = auth.uid() AND u.role = 'ADMIN')
    );

-- Transactions: own or admin
CREATE POLICY "User can view own transactions" ON transactions
    FOR SELECT USING (user_id IN (SELECT user_id FROM users WHERE auth_uid = auth.uid()));
CREATE POLICY "Admin can manage all transactions" ON transactions
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users u WHERE u.auth_uid = auth.uid() AND u.role = 'ADMIN')
    );

-- Form_History: own or admin
CREATE POLICY "User can view own history" ON form_history
    FOR SELECT USING (user_id IN (SELECT user_id FROM users WHERE auth_uid = auth.uid()));
CREATE POLICY "User can insert own history" ON form_history
    FOR INSERT WITH CHECK (user_id IN (SELECT user_id FROM users WHERE auth_uid = auth.uid()));
CREATE POLICY "Admin can manage all history" ON form_history
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users u WHERE u.auth_uid = auth.uid() AND u.role = 'ADMIN')
    );

-- ============================================================
-- Function: Auto-create user profile & wallet on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_user_id INT;
BEGIN
    INSERT INTO public.users (auth_uid, email, role, status)
    VALUES (NEW.id, NEW.email, 'USER', 'active')
    RETURNING user_id INTO new_user_id;

    INSERT INTO public.user_profile (user_id, full_name)
    VALUES (new_user_id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)));

    INSERT INTO public.user_wallet (user_id, form_balance, total_forms_added, total_forms_used)
    VALUES (new_user_id, 0, 0, 0);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Function: Approve order (admin duyệt đơn)
-- ============================================================
CREATE OR REPLACE FUNCTION public.approve_order(p_order_id INT, p_admin_user_id INT)
RETURNS VOID AS $$
DECLARE
    v_user_id INT;
    v_forms INT;
    v_balance INT;
BEGIN
    SELECT user_id, forms_to_add INTO v_user_id, v_forms
    FROM orders WHERE order_id = p_order_id AND status = 'pending';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order not found or not pending';
    END IF;

    -- Update order
    UPDATE orders SET status = 'approved', updated_at = NOW() WHERE order_id = p_order_id;

    -- Update payment
    UPDATE payments SET status = 'confirmed', confirmed_by = p_admin_user_id, confirmed_at = NOW()
    WHERE order_id = p_order_id;

    -- Get current balance
    SELECT form_balance INTO v_balance FROM user_wallet WHERE user_id = v_user_id FOR UPDATE;

    -- Update wallet
    UPDATE user_wallet
    SET form_balance = form_balance + v_forms,
        total_forms_added = total_forms_added + v_forms,
        last_updated = NOW()
    WHERE user_id = v_user_id;

    -- Insert transaction
    INSERT INTO transactions (user_id, order_id, type, amount, balance_before, balance_after, description)
    VALUES (v_user_id, p_order_id, 'credit', v_forms, v_balance, v_balance + v_forms,
            'Duyệt đơn #' || p_order_id || ' — Nạp ' || (v_forms * 350)::TEXT || ' VNĐ');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Function: Use tool (trừ form)
-- ============================================================
CREATE OR REPLACE FUNCTION public.use_form_credit(
    p_user_id INT,
    p_tool_name VARCHAR DEFAULT 'Auto Fill',
    p_form_url TEXT DEFAULT NULL,
    p_ip_address VARCHAR DEFAULT NULL
)
RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
DECLARE
    v_balance INT;
    v_txn_id INT;
BEGIN
    SELECT form_balance INTO v_balance
    FROM user_wallet WHERE user_id = p_user_id FOR UPDATE;

    IF v_balance IS NULL THEN
        INSERT INTO form_history (user_id, tool_name, form_url, ip_address, status, error_message)
        VALUES (p_user_id, p_tool_name, p_form_url, p_ip_address, 'failed', 'Wallet not found');
        RETURN QUERY SELECT false, 'Wallet not found'::TEXT;
        RETURN;
    END IF;

    IF v_balance <= 0 THEN
        INSERT INTO form_history (user_id, tool_name, form_url, ip_address, status, error_message)
        VALUES (p_user_id, p_tool_name, p_form_url, p_ip_address, 'blocked', 'Hết form credits. Vui lòng nạp thêm.');
        RETURN QUERY SELECT false, 'Hết form credits'::TEXT;
        RETURN;
    END IF;

    -- Deduct
    UPDATE user_wallet
    SET form_balance = form_balance - 1,
        total_forms_used = total_forms_used + 1,
        last_updated = NOW()
    WHERE user_id = p_user_id;

    -- Transaction
    INSERT INTO transactions (user_id, type, amount, balance_before, balance_after, description)
    VALUES (p_user_id, 'debit', 1, v_balance, v_balance - 1, 'Dùng tool ' || p_tool_name)
    RETURNING txn_id INTO v_txn_id;

    -- History
    INSERT INTO form_history (user_id, txn_id, tool_name, form_url, ip_address, status)
    VALUES (p_user_id, v_txn_id, p_tool_name, p_form_url, p_ip_address, 'success');

    RETURN QUERY SELECT true, 'OK'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SME Business Manager — Initial Schema
-- Safe to re-run: all statements use CREATE TABLE IF NOT EXISTS

CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
  email         VARCHAR(255)    NOT NULL UNIQUE,
  password_hash VARCHAR(255)    NOT NULL,
  role          ENUM('admin','staff') NOT NULL DEFAULT 'staff',
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED  NOT NULL,
  token_hash  VARCHAR(255)  NOT NULL,
  expires_at  TIMESTAMP     NOT NULL,
  revoked_at  TIMESTAMP     NULL DEFAULT NULL,
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_rt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_rt_token_hash (token_hash),
  INDEX idx_rt_user_id    (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── CRM ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS contacts (
  id          INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  first_name  VARCHAR(100)  NOT NULL,
  last_name   VARCHAR(100)  NOT NULL,
  email       VARCHAR(255)  NULL,
  phone       VARCHAR(20)   NULL,
  company     VARCHAR(100)  NULL,
  created_by  INT UNSIGNED  NULL,
  deleted_at  TIMESTAMP     NULL DEFAULT NULL,
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_contact_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_contacts_deleted_at (deleted_at),
  INDEX idx_contacts_email      (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS contact_notes (
  id          INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  contact_id  INT UNSIGNED  NOT NULL,
  user_id     INT UNSIGNED  NULL,
  content     TEXT          NOT NULL,
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_cn_contact FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
  CONSTRAINT fk_cn_user    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE SET NULL,
  INDEX idx_cn_contact_id (contact_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS deals (
  id          INT UNSIGNED             AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(200)             NOT NULL,
  contact_id  INT UNSIGNED             NOT NULL,
  stage       ENUM('lead','active','closed') NOT NULL DEFAULT 'lead',
  value       DECIMAL(12,2)            NOT NULL DEFAULT 0.00,
  notes       TEXT                     NULL,
  created_by  INT UNSIGNED             NULL,
  created_at  TIMESTAMP                NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP                NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_deal_contact FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
  CONSTRAINT fk_deal_creator FOREIGN KEY (created_by) REFERENCES users(id)    ON DELETE SET NULL,
  INDEX idx_deals_contact_id (contact_id),
  INDEX idx_deals_stage      (stage)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS deal_activities (
  id        INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  deal_id   INT UNSIGNED  NOT NULL,
  user_id   INT UNSIGNED  NULL,
  action    VARCHAR(500)  NOT NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_da_deal FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE,
  CONSTRAINT fk_da_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_da_deal_id (deal_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Inventory ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS products (
  id                  INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  sku                 VARCHAR(50)   NOT NULL UNIQUE,
  name                VARCHAR(200)  NOT NULL,
  category            VARCHAR(100)  NOT NULL,
  unit_price          DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  stock_qty           INT           NOT NULL DEFAULT 0,
  low_stock_threshold INT           NOT NULL DEFAULT 10,
  deleted_at          TIMESTAMP     NULL DEFAULT NULL,
  created_at          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_products_deleted_at (deleted_at),
  INDEX idx_products_sku        (sku),
  INDEX idx_products_category   (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS stock_movements (
  id          INT UNSIGNED                   AUTO_INCREMENT PRIMARY KEY,
  product_id  INT UNSIGNED                   NOT NULL,
  type        ENUM('stock_in','stock_out')    NOT NULL,
  qty         INT                            NOT NULL,
  reason      VARCHAR(255)                   NOT NULL,
  user_id     INT UNSIGNED                   NULL,
  created_at  TIMESTAMP                      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sm_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_sm_user    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE SET NULL,
  INDEX idx_sm_product_id  (product_id),
  INDEX idx_sm_created_at  (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Orders ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS orders (
  id          INT UNSIGNED                            AUTO_INCREMENT PRIMARY KEY,
  contact_id  INT UNSIGNED                            NOT NULL,
  status      ENUM('pending','fulfilled','cancelled') NOT NULL DEFAULT 'pending',
  total       DECIMAL(12,2)                           NOT NULL DEFAULT 0.00,
  created_by  INT UNSIGNED                            NULL,
  created_at  TIMESTAMP                               NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP                               NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_contact FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE RESTRICT,
  CONSTRAINT fk_order_creator FOREIGN KEY (created_by) REFERENCES users(id)    ON DELETE SET NULL,
  INDEX idx_orders_contact_id (contact_id),
  INDEX idx_orders_status     (status),
  INDEX idx_orders_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_items (
  id          INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  order_id    INT UNSIGNED  NOT NULL,
  product_id  INT UNSIGNED  NOT NULL,
  qty         INT           NOT NULL,
  unit_price  DECIMAL(12,2) NOT NULL,
  subtotal    DECIMAL(12,2) NOT NULL,
  CONSTRAINT fk_oi_order   FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
  CONSTRAINT fk_oi_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  INDEX idx_oi_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_status_history (
  id          INT UNSIGNED                            AUTO_INCREMENT PRIMARY KEY,
  order_id    INT UNSIGNED                            NOT NULL,
  status      ENUM('pending','fulfilled','cancelled') NOT NULL,
  changed_by  INT UNSIGNED                            NULL,
  changed_at  TIMESTAMP                               NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_osh_order FOREIGN KEY (order_id)   REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_osh_user  FOREIGN KEY (changed_by) REFERENCES users(id)  ON DELETE SET NULL,
  INDEX idx_osh_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

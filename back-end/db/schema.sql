-- =====================================================================
-- Industrial Employee Burnout Detection System – MySQL schema
-- ---------------------------------------------------------------------
-- Run this file against an empty database (the database itself must
-- already exist; create it through your cloud provider's console).
--
-- Engine: InnoDB. Charset: utf8mb4 (full Unicode + emoji safe).
-- Character set / collation should be set at the database level too.
--
-- Tested against MySQL 8.x and PlanetScale-style flavours.
-- =====================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------
-- 1. Identity & authentication
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id              INT             NOT NULL AUTO_INCREMENT,
  email           VARCHAR(255)    NOT NULL,
  password_hash   VARCHAR(255)    NOT NULL,
  first_name      VARCHAR(100)    NOT NULL,
  last_name       VARCHAR(100)    NOT NULL,
  gender          ENUM('Male','Female','Other') NOT NULL,
  date_of_birth   DATE            NULL,
  role            ENUM('employee','admin') NOT NULL DEFAULT 'employee',
  is_active       TINYINT(1)      NOT NULL DEFAULT 1,
  created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
                                  ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ---------------------------------------------------------------------
-- 2. Departments (lookup)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS departments;
CREATE TABLE departments (
  id          INT          NOT NULL AUTO_INCREMENT,
  name        VARCHAR(100) NOT NULL,
  location    VARCHAR(100) NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_departments_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ---------------------------------------------------------------------
-- 3. Simulated HR profile (1 ↔ 1 with users)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS hr_profiles;
CREATE TABLE hr_profiles (
  id                   INT          NOT NULL AUTO_INCREMENT,
  user_id              INT          NOT NULL,
  department_id        INT          NOT NULL,
  date_of_joining      DATE         NOT NULL,
  company_type         ENUM('Service','Product') NOT NULL,
  wfh_available        TINYINT(1)   NOT NULL DEFAULT 0,
  designation          INT          NOT NULL,
  resource_allocation  INT          NULL,
  shift_type           ENUM('Day','Night','Rotating') NOT NULL DEFAULT 'Day',
  created_at           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
                                    ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_hr_profiles_user (user_id),
  KEY idx_hr_profiles_department (department_id),
  CONSTRAINT fk_hr_profiles_user
      FOREIGN KEY (user_id)       REFERENCES users(id)        ON DELETE CASCADE,
  CONSTRAINT fk_hr_profiles_dept
      FOREIGN KEY (department_id) REFERENCES departments(id)  ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ---------------------------------------------------------------------
-- 4. Assessment results (one row per completed quiz)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS assessment_results;
CREATE TABLE assessment_results (
  id                       INT          NOT NULL AUTO_INCREMENT,
  user_id                  INT          NOT NULL,
  personal_burnout_score   FLOAT        NULL,
  work_burnout_score       FLOAT        NULL,
  mental_fatigue_score     FLOAT        NOT NULL,
  predicted_burn_rate      FLOAT        NOT NULL,
  risk_level               ENUM('low','moderate','high','critical') NOT NULL,
  taken_at                 TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_user_history (user_id, taken_at),
  KEY idx_risk_level (risk_level),
  CONSTRAINT fk_assessment_user
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ---------------------------------------------------------------------
-- 5. Alerts (auto-generated when assessments cross thresholds)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS alerts;
CREATE TABLE alerts (
  id                    INT          NOT NULL AUTO_INCREMENT,
  assessment_result_id  INT          NOT NULL,
  user_id               INT          NOT NULL,
  alert_type            ENUM('high_risk','critical_risk','trend_spike') NOT NULL,
  message               TEXT         NOT NULL,
  is_read               TINYINT(1)   NOT NULL DEFAULT 0,
  created_at            TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_unread_alerts (is_read, created_at),
  KEY idx_alerts_user (user_id),
  CONSTRAINT fk_alerts_assessment
      FOREIGN KEY (assessment_result_id) REFERENCES assessment_results(id)
      ON DELETE CASCADE,
  CONSTRAINT fk_alerts_user
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ---------------------------------------------------------------------
-- 6. Curated mental-health resources (admin-managed)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS help_resources;
CREATE TABLE help_resources (
  id              INT          NOT NULL AUTO_INCREMENT,
  title           VARCHAR(200) NOT NULL,
  description     TEXT         NULL,
  url             VARCHAR(500) NULL,
  min_risk_level  ENUM('low','moderate','high','critical') NOT NULL,
  is_active       TINYINT(1)   NOT NULL DEFAULT 1,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_help_resources_active (is_active, min_risk_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


SET FOREIGN_KEY_CHECKS = 1;


-- =====================================================================
-- Reference data (idempotent)
-- ---------------------------------------------------------------------
-- These rows are safe to re-run; INSERT IGNORE skips duplicates.
-- The admin user and the CBI MongoDB document are seeded by Node:
--     npm run seed
-- =====================================================================

INSERT IGNORE INTO departments (name, location) VALUES
  ('Assembly Line A', 'Building 1'),
  ('Assembly Line B', 'Building 1'),
  ('Maintenance',     'Building 2'),
  ('Quality Control', 'Building 2'),
  ('Packaging',       'Building 3'),
  ('Logistics',       'Building 3');

INSERT IGNORE INTO help_resources (title, description, url, min_risk_level, is_active) VALUES
  ('National Mental Health Hotline',
   'Free 24/7 support line for workers experiencing burnout or stress.',
   'https://example.com/hotline',
   'high',
   1),
  ('Stress Management Techniques',
   'Evidence-based exercises for managing workplace fatigue.',
   'https://example.com/stress-guide',
   'moderate',
   1),
  ('Sleep Hygiene Basics',
   'A short guide to improving sleep quality on shift work.',
   'https://example.com/sleep',
   'low',
   1),
  ('Workplace Wellness Program',
   'Company-sponsored counselling sessions and ergonomic checks.',
   'https://example.com/wellness',
   'high',
   1),
  ('Crisis Support: Talk Now',
   'Immediate professional help for workers in critical distress.',
   'https://example.com/crisis',
   'critical',
   1);

-- Bus KM System - SQLite schema
-- Applied automatically on server startup (config/database.js).
-- Open database/BusKMSystem.db in "DB Browser for SQLite" to inspect data directly.

CREATE TABLE IF NOT EXISTS tblBuses (
    BusID           INTEGER PRIMARY KEY AUTOINCREMENT,
    BusNumber       TEXT NOT NULL UNIQUE,
    BusName         TEXT,
    Status          TEXT NOT NULL DEFAULT 'Active' CHECK (Status IN ('Active','Inactive')),
    CreatedDate     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tblUsers (
    UserID          INTEGER PRIMARY KEY AUTOINCREMENT,
    Username        TEXT NOT NULL UNIQUE,
    PasswordHash    TEXT NOT NULL,
    Role            TEXT NOT NULL CHECK (Role IN ('admin','portal1','portal2')),
    IsActive        INTEGER NOT NULL DEFAULT 1,
    BusID           INTEGER REFERENCES tblBuses(BusID),
    CreatedDate     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tblEmployees (
    EmployeeID      TEXT PRIMARY KEY,
    ICNumber        TEXT,
    EmployeeName    TEXT NOT NULL,
    Department      TEXT,
    Status          TEXT NOT NULL DEFAULT 'Active' CHECK (Status IN ('Active','Inactive')),
    CreatedDate     TEXT NOT NULL DEFAULT (datetime('now'))
);

-- The one transaction table. Portal 1 fills EmployeeID+BusID+TravelDate.
-- Portal 2 fills KM on the same row, matched by EmployeeID+TravelDate.
CREATE TABLE IF NOT EXISTS tblBusEmployee (
    ID              INTEGER PRIMARY KEY AUTOINCREMENT,
    EmployeeID      TEXT NOT NULL REFERENCES tblEmployees(EmployeeID),
    BusID           INTEGER REFERENCES tblBuses(BusID),
    TravelDate      TEXT NOT NULL,
    KM              REAL,
    Status          TEXT NOT NULL DEFAULT 'Bus Pending' CHECK (Status IN ('Bus Pending','KM Pending','Completed')),
    ScannedBy       TEXT,
    ScannedAt       TEXT,
    CreatedDate     TEXT NOT NULL DEFAULT (datetime('now')),
    UpdatedDate     TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (EmployeeID, TravelDate)
);

CREATE INDEX IF NOT EXISTS IX_BusEmployee_EmployeeDate ON tblBusEmployee (EmployeeID, TravelDate);
CREATE INDEX IF NOT EXISTS IX_BusEmployee_Bus ON tblBusEmployee (BusID);
CREATE INDEX IF NOT EXISTS IX_BusEmployee_Status ON tblBusEmployee (Status);

-- Sample seed data (safe to delete rows via DB Browser if not wanted)
INSERT OR IGNORE INTO tblBuses (BusNumber, BusName) VALUES
('BUS-001', 'Route A'),
('BUS-002', 'Route B');

INSERT OR IGNORE INTO tblEmployees (EmployeeID, ICNumber, EmployeeName, Department) VALUES
('EMP001', '901234567V', 'Kumar', 'Operations'),
('EMP002', '921234567V', 'Siva', 'Logistics'),
('EMP003', '930987654V', 'Nimal', 'Operations');

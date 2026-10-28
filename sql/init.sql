-- Clinical EHR & Healthcare Administrative Portal
-- PostgreSQL Database Initialization Schema

CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    mrn VARCHAR(20) UNIQUE NOT NULL, -- Medical Record Number
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    dob DATE NOT NULL,
    gender VARCHAR(20) NOT NULL,
    blood_type VARCHAR(5),
    phone VARCHAR(25),
    email VARCHAR(100),
    allergies TEXT[] DEFAULT '{}',
    chronic_conditions TEXT[] DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'Active', -- Active, Inpatient, Discharged
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    provider_name VARCHAR(100) NOT NULL,
    department VARCHAR(50) NOT NULL,
    appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    status VARCHAR(25) DEFAULT 'Scheduled', -- Scheduled, Arrived, In-Consultation, Completed, Cancelled
    reason VARCHAR(255) NOT NULL,
    room VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS encounters (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    provider_name VARCHAR(100) NOT NULL,
    encounter_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    chief_complaint TEXT NOT NULL,
    vitals JSONB NOT NULL, -- { systolic: 120, diastolic: 80, pulse: 72, temp: 98.6, o2_sat: 98 }
    diagnosis VARCHAR(255) NOT NULL,
    prescriptions JSONB DEFAULT '[]',
    clinical_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    action VARCHAR(50) NOT NULL,
    resource VARCHAR(50) NOT NULL,
    resource_id VARCHAR(50),
    details JSONB,
    status VARCHAR(20) DEFAULT 'SUCCESS',
    latency_ms INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for high-concurrency lookup performance
CREATE INDEX IF NOT EXISTS idx_patients_mrn ON patients(mrn);
CREATE INDEX IF NOT EXISTS idx_patients_last_name ON patients(last_name);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_encounters_patient ON encounters(patient_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);

-- Initial Mock Data Seeding
INSERT INTO patients (mrn, first_name, last_name, dob, gender, blood_type, phone, email, allergies, chronic_conditions, status)
VALUES 
('MRN-9021', 'Eleanor', 'Vance', '1984-04-12', 'Female', 'O+', '+1 (555) 234-5678', 'eleanor.vance@medmail.com', '{"Penicillin", "Sulfa"}', '{"Hypertension", "Type 2 Diabetes"}', 'Active'),
('MRN-9022', 'Marcus', 'Chen', '1979-11-23', 'Male', 'A-', '+1 (555) 876-5432', 'marcus.chen@medmail.com', '{"Aspirin"}', '{"Asthma"}', 'Active'),
('MRN-9023', 'Sophia', 'Rodriguez', '1995-07-30', 'Female', 'B+', '+1 (555) 345-6789', 'sophia.r@medmail.com', '{}', '{}', 'Inpatient'),
('MRN-9024', 'David', 'Kim', '1968-02-14', 'Male', 'AB+', '+1 (555) 654-9870', 'dkim@medmail.com', '{"Latex", "Codeine"}', '{"Coronary Artery Disease"}', 'Active'),
('MRN-9025', 'Sarah', 'Jenkins', '2001-09-05', 'Female', 'O-', '+1 (555) 432-1098', 'sjenkins@medmail.com', '{}', '{"Migraine"}', 'Active')
ON CONFLICT (mrn) DO NOTHING;

INSERT INTO appointments (patient_id, provider_name, department, appointment_date, duration_minutes, status, reason, room)
VALUES
(1, 'Dr. Gregory House', 'Internal Medicine', NOW() + INTERVAL '1 hour', 45, 'Scheduled', 'Quarterly Diabetes & BP Follow-up', 'Room 302'),
(2, 'Dr. Allison Cameron', 'Pulmonology', NOW() + INTERVAL '2 hours', 30, 'Arrived', 'Asthma Wheezing and Spirometry', 'Room 108'),
(3, 'Dr. Robert Chase', 'Cardiology', NOW() + INTERVAL '3 hours', 60, 'Scheduled', 'Post-Op Observation', 'ICU-B'),
(4, 'Dr. Eric Foreman', 'Neurology', NOW() + INTERVAL '4 hours', 30, 'Scheduled', 'Routine Neuro Assessment', 'Room 205'),
(5, 'Dr. Gregory House', 'Internal Medicine', NOW() + INTERVAL '5 hours', 30, 'Scheduled', 'Migraine Medication Review', 'Room 302')
ON CONFLICT DO NOTHING;

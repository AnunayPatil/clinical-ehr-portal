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

-- Initial Mock Data Seeding (Indian Demographics & Gmail)
INSERT INTO patients (mrn, first_name, last_name, dob, gender, blood_type, phone, email, allergies, chronic_conditions, status)
VALUES 
('MRN-9021', 'Aarav', 'Sharma', '1984-04-12', 'Male', 'B+', '+91 98201 45678', 'aarav.sharma84@gmail.com', '{"Penicillin", "Sulfa drugs"}', '{"Hypertension", "Type 2 Diabetes"}', 'Active'),
('MRN-9022', 'Priya', 'Patel', '1991-08-23', 'Female', 'O+', '+91 98450 12345', 'priya.patel.med@gmail.com', '{"Aspirin"}', '{"Asthma"}', 'Active'),
('MRN-9023', 'Rajesh', 'Verma', '1975-11-15', 'Male', 'A+', '+91 99102 34567', 'rajesh.verma75@gmail.com', '{}', '{"Coronary Artery Disease"}', 'Inpatient'),
('MRN-9024', 'Ananya', 'Iyer', '1996-03-29', 'Female', 'AB+', '+91 98840 98765', 'ananya.iyer.ai@gmail.com', '{"Latex", "Codeine"}', '{"Migraine"}', 'Active'),
('MRN-9025', 'Vikram', 'Malhotra', '1988-06-18', 'Male', 'O-', '+91 98111 22334', 'vikram.malhotra88@gmail.com', '{}', '{"Hyperlipidemia"}', 'Active'),
('MRN-9026', 'Sunita', 'Rao', '1965-12-05', 'Female', 'B-', '+91 94480 55667', 'sunita.rao65@gmail.com', '{"Morphine"}', '{"Osteoarthritis", "Thyroid Disorder"}', 'Active')
ON CONFLICT (mrn) DO NOTHING;

INSERT INTO appointments (patient_id, provider_name, department, appointment_date, duration_minutes, status, reason, room)
VALUES
(1, 'Dr. Rajesh Gupta', 'Internal Medicine', NOW() + INTERVAL '1 hour', 45, 'Scheduled', 'Quarterly Diabetes & BP Follow-up', 'Room 302'),
(2, 'Dr. Sunita Mehra', 'Pulmonology', NOW() + INTERVAL '2 hours', 30, 'Arrived', 'Asthma Wheezing and Spirometry Review', 'Room 108'),
(3, 'Dr. Vikram Deshmukh', 'Cardiology', NOW() + INTERVAL '3 hours', 60, 'Scheduled', 'Post-Angioplasty Monitoring', 'ICU-B'),
(4, 'Dr. Amit Verma', 'Neurology', NOW() + INTERVAL '4 hours', 30, 'Scheduled', 'Migraine Prophylaxis & Neuro Exam', 'Room 205'),
(5, 'Dr. Rajesh Gupta', 'Internal Medicine', NOW() + INTERVAL '5 hours', 30, 'Scheduled', 'Lipid Profile & Lifestyle Consultation', 'Room 302')
ON CONFLICT DO NOTHING;

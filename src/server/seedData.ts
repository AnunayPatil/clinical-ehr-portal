export interface Patient {
  id: number;
  mrn: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  bloodType: string;
  phone: string;
  email: string;
  allergies: string[];
  chronicConditions: string[];
  status: 'Active' | 'Inpatient' | 'Discharged';
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: number;
  patientId: number;
  patientName?: string;
  providerName: string;
  department: string;
  appointmentDate: string;
  durationMinutes: number;
  status: 'Scheduled' | 'Arrived' | 'In-Consultation' | 'Completed' | 'Cancelled';
  reason: string;
  room: string;
  createdAt: string;
}

export interface Vitals {
  systolic: number;
  diastolic: number;
  pulse: number;
  temperature: number;
  o2Saturation: number;
  bloodGlucose?: number;
}

export interface Prescription {
  medication: string;
  dosage: string;
  frequency: string;
  durationDays: number;
}

export interface Encounter {
  id: number;
  patientId: number;
  providerName: string;
  encounterDate: string;
  chiefComplaint: string;
  vitals: Vitals;
  diagnosis: string;
  prescriptions: Prescription[];
  clinicalNotes: string;
  createdAt: string;
}

export interface AuditLog {
  id: number;
  action: string;
  resource: string;
  resourceId?: string;
  details: any;
  status: 'SUCCESS' | 'RATE_LIMITED' | 'VALIDATION_FAILED' | 'ERROR';
  latencyMs: number;
  createdAt: string;
}

export const initialPatients: Patient[] = [
  {
    id: 1,
    mrn: 'MRN-9021',
    firstName: 'Aarav',
    lastName: 'Sharma',
    dob: '1984-04-12',
    gender: 'Male',
    bloodType: 'B+',
    phone: '+91 98201 45678',
    email: 'aarav.sharma84@gmail.com',
    allergies: ['Penicillin', 'Sulfa drugs'],
    chronicConditions: ['Hypertension', 'Type 2 Diabetes'],
    status: 'Active',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    mrn: 'MRN-9022',
    firstName: 'Priya',
    lastName: 'Patel',
    dob: '1991-08-23',
    gender: 'Female',
    bloodType: 'O+',
    phone: '+91 98450 12345',
    email: 'priya.patel.med@gmail.com',
    allergies: ['Aspirin'],
    chronicConditions: ['Asthma'],
    status: 'Active',
    createdAt: new Date(Date.now() - 86400000 * 25).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 3,
    mrn: 'MRN-9023',
    firstName: 'Rajesh',
    lastName: 'Verma',
    dob: '1975-11-15',
    gender: 'Male',
    bloodType: 'A+',
    phone: '+91 99102 34567',
    email: 'rajesh.verma75@gmail.com',
    allergies: [],
    chronicConditions: ['Coronary Artery Disease'],
    status: 'Inpatient',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 4,
    mrn: 'MRN-9024',
    firstName: 'Ananya',
    lastName: 'Iyer',
    dob: '1996-03-29',
    gender: 'Female',
    bloodType: 'AB+',
    phone: '+91 98840 98765',
    email: 'ananya.iyer.ai@gmail.com',
    allergies: ['Latex', 'Codeine'],
    chronicConditions: ['Migraine'],
    status: 'Active',
    createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 5,
    mrn: 'MRN-9025',
    firstName: 'Vikram',
    lastName: 'Malhotra',
    dob: '1988-06-18',
    gender: 'Male',
    bloodType: 'O-',
    phone: '+91 98111 22334',
    email: 'vikram.malhotra88@gmail.com',
    allergies: [],
    chronicConditions: ['Hyperlipidemia'],
    status: 'Active',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 6,
    mrn: 'MRN-9026',
    firstName: 'Sunita',
    lastName: 'Rao',
    dob: '1965-12-05',
    gender: 'Female',
    bloodType: 'B-',
    phone: '+91 94480 55667',
    email: 'sunita.rao65@gmail.com',
    allergies: ['Morphine'],
    chronicConditions: ['Osteoarthritis', 'Thyroid Disorder'],
    status: 'Active',
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const initialAppointments: Appointment[] = [
  {
    id: 1,
    patientId: 1,
    patientName: 'Aarav Sharma',
    providerName: 'Dr. Rajesh Gupta',
    department: 'Internal Medicine',
    appointmentDate: new Date(Date.now() + 3600000).toISOString(),
    durationMinutes: 45,
    status: 'Scheduled',
    reason: 'Quarterly Diabetes & BP Follow-up',
    room: 'Room 302',
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    patientId: 2,
    patientName: 'Priya Patel',
    providerName: 'Dr. Sunita Mehra',
    department: 'Pulmonology',
    appointmentDate: new Date(Date.now() + 7200000).toISOString(),
    durationMinutes: 30,
    status: 'Arrived',
    reason: 'Asthma Wheezing and Spirometry Review',
    room: 'Room 108',
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    patientId: 3,
    patientName: 'Rajesh Verma',
    providerName: 'Dr. Vikram Deshmukh',
    department: 'Cardiology',
    appointmentDate: new Date(Date.now() + 10800000).toISOString(),
    durationMinutes: 60,
    status: 'Scheduled',
    reason: 'Post-Angioplasty Monitoring',
    room: 'ICU-B',
    createdAt: new Date().toISOString()
  },
  {
    id: 4,
    patientId: 4,
    patientName: 'Ananya Iyer',
    providerName: 'Dr. Amit Verma',
    department: 'Neurology',
    appointmentDate: new Date(Date.now() + 14400000).toISOString(),
    durationMinutes: 30,
    status: 'In-Consultation',
    reason: 'Migraine Prophylaxis & Neuro Exam',
    room: 'Room 205',
    createdAt: new Date().toISOString()
  },
  {
    id: 5,
    patientId: 5,
    patientName: 'Vikram Malhotra',
    providerName: 'Dr. Rajesh Gupta',
    department: 'Internal Medicine',
    appointmentDate: new Date(Date.now() + 18000000).toISOString(),
    durationMinutes: 30,
    status: 'Scheduled',
    reason: 'Lipid Profile & Lifestyle Consultation',
    room: 'Room 302',
    createdAt: new Date().toISOString()
  }
];

export const initialEncounters: Encounter[] = [
  {
    id: 1,
    patientId: 1,
    providerName: 'Dr. Rajesh Gupta',
    encounterDate: new Date(Date.now() - 86400000 * 7).toISOString(),
    chiefComplaint: 'Follow-up for morning dizziness and post-prandial blood sugar spikes.',
    vitals: {
      systolic: 134,
      diastolic: 86,
      pulse: 74,
      temperature: 98.4,
      o2Saturation: 99,
      bloodGlucose: 140
    },
    diagnosis: 'Type 2 Diabetes Mellitus with stage 1 hypertension',
    prescriptions: [
      { medication: 'Metformin HCl', dosage: '500 mg', frequency: 'Twice daily with meals', durationDays: 90 },
      { medication: 'Telmisartan', dosage: '40 mg', frequency: 'Once daily in morning', durationDays: 90 }
    ],
    clinicalNotes: 'Dietary intake reviewed. Fasting blood sugar target discussed. Advised daily morning BP tracking.',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString()
  },
  {
    id: 2,
    patientId: 2,
    providerName: 'Dr. Sunita Mehra',
    encounterDate: new Date(Date.now() - 86400000 * 14).toISOString(),
    chiefComplaint: 'Mild expiratory wheezing during seasonal changes and morning walks.',
    vitals: {
      systolic: 118,
      diastolic: 76,
      pulse: 70,
      temperature: 98.6,
      o2Saturation: 98
    },
    diagnosis: 'Mild Persistent Asthma with seasonal allergy trigger',
    prescriptions: [
      { medication: 'Budesonide + Formoterol Inhaler', dosage: '200/6 mcg', frequency: '1 puff twice daily', durationDays: 60 },
      { medication: 'Levocetirizine', dosage: '5 mg', frequency: 'Once daily at bedtime', durationDays: 15 }
    ],
    clinicalNotes: 'Bilateral lung sounds clear with faint end-expiratory rhonchi in lower zones. Peak flow stable.',
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString()
  }
];

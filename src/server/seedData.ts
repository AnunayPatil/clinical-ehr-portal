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
    firstName: 'Eleanor',
    lastName: 'Vance',
    dob: '1984-04-12',
    gender: 'Female',
    bloodType: 'O+',
    phone: '+1 (555) 234-5678',
    email: 'eleanor.vance@medmail.com',
    allergies: ['Penicillin', 'Sulfa drugs'],
    chronicConditions: ['Hypertension', 'Type 2 Diabetes'],
    status: 'Active',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    mrn: 'MRN-9022',
    firstName: 'Marcus',
    lastName: 'Chen',
    dob: '1979-11-23',
    gender: 'Male',
    bloodType: 'A-',
    phone: '+1 (555) 876-5432',
    email: 'marcus.chen@medmail.com',
    allergies: ['Aspirin'],
    chronicConditions: ['Asthma'],
    status: 'Active',
    createdAt: new Date(Date.now() - 86400000 * 25).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 3,
    mrn: 'MRN-9023',
    firstName: 'Sophia',
    lastName: 'Rodriguez',
    dob: '1995-07-30',
    gender: 'Female',
    bloodType: 'B+',
    phone: '+1 (555) 345-6789',
    email: 'sophia.r@medmail.com',
    allergies: [],
    chronicConditions: [],
    status: 'Inpatient',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 4,
    mrn: 'MRN-9024',
    firstName: 'David',
    lastName: 'Kim',
    dob: '1968-02-14',
    gender: 'Male',
    bloodType: 'AB+',
    phone: '+1 (555) 654-9870',
    email: 'dkim@medmail.com',
    allergies: ['Latex', 'Codeine'],
    chronicConditions: ['Coronary Artery Disease'],
    status: 'Active',
    createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 5,
    mrn: 'MRN-9025',
    firstName: 'Sarah',
    lastName: 'Jenkins',
    dob: '2001-09-05',
    gender: 'Female',
    bloodType: 'O-',
    phone: '+1 (555) 432-1098',
    email: 'sjenkins@medmail.com',
    allergies: [],
    chronicConditions: ['Migraine'],
    status: 'Active',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 6,
    mrn: 'MRN-9026',
    firstName: 'Arthur',
    lastName: 'Pendelton',
    dob: '1952-12-01',
    gender: 'Male',
    bloodType: 'A+',
    phone: '+1 (555) 998-1122',
    email: 'arthur.p@medmail.com',
    allergies: ['Morphine'],
    chronicConditions: ['Osteoarthritis', 'Hyperlipidemia'],
    status: 'Active',
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const initialAppointments: Appointment[] = [
  {
    id: 1,
    patientId: 1,
    patientName: 'Eleanor Vance',
    providerName: 'Dr. Gregory House',
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
    patientName: 'Marcus Chen',
    providerName: 'Dr. Allison Cameron',
    department: 'Pulmonology',
    appointmentDate: new Date(Date.now() + 7200000).toISOString(),
    durationMinutes: 30,
    status: 'Arrived',
    reason: 'Asthma Wheezing and Spirometry',
    room: 'Room 108',
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    patientId: 3,
    patientName: 'Sophia Rodriguez',
    providerName: 'Dr. Robert Chase',
    department: 'Cardiology',
    appointmentDate: new Date(Date.now() + 10800000).toISOString(),
    durationMinutes: 60,
    status: 'Scheduled',
    reason: 'Post-Op Cardiac Monitoring',
    room: 'ICU-B',
    createdAt: new Date().toISOString()
  },
  {
    id: 4,
    patientId: 4,
    patientName: 'David Kim',
    providerName: 'Dr. Eric Foreman',
    department: 'Neurology',
    appointmentDate: new Date(Date.now() + 14400000).toISOString(),
    durationMinutes: 30,
    status: 'In-Consultation',
    reason: 'Peripheral Neuropathy Follow-up',
    room: 'Room 205',
    createdAt: new Date().toISOString()
  },
  {
    id: 5,
    patientId: 5,
    patientName: 'Sarah Jenkins',
    providerName: 'Dr. Gregory House',
    department: 'Internal Medicine',
    appointmentDate: new Date(Date.now() + 18000000).toISOString(),
    durationMinutes: 30,
    status: 'Scheduled',
    reason: 'Refractory Migraine Evaluation',
    room: 'Room 302',
    createdAt: new Date().toISOString()
  }
];

export const initialEncounters: Encounter[] = [
  {
    id: 1,
    patientId: 1,
    providerName: 'Dr. Gregory House',
    encounterDate: new Date(Date.now() - 86400000 * 7).toISOString(),
    chiefComplaint: 'Follow-up for blood glucose fluctuations and morning dizziness.',
    vitals: {
      systolic: 138,
      diastolic: 88,
      pulse: 74,
      temperature: 98.4,
      o2Saturation: 99,
      bloodGlucose: 142
    },
    diagnosis: 'Type 2 Diabetes Mellitus with mild hypertension',
    prescriptions: [
      { medication: 'Metformin HCl', dosage: '500 mg', frequency: 'Twice daily with meals', durationDays: 90 },
      { medication: 'Lisinopril', dosage: '10 mg', frequency: 'Once daily in morning', durationDays: 90 }
    ],
    clinicalNotes: 'Patient reports improved dietary compliance. HbA1c target discussed. Continue current regimen with morning BP logs.',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString()
  },
  {
    id: 2,
    patientId: 2,
    providerName: 'Dr. Allison Cameron',
    encounterDate: new Date(Date.now() - 86400000 * 14).toISOString(),
    chiefComplaint: 'Mild wheezing provoked by cold weather during morning runs.',
    vitals: {
      systolic: 122,
      diastolic: 78,
      pulse: 68,
      temperature: 98.6,
      o2Saturation: 97
    },
    diagnosis: 'Mild Persistent Asthma with exercise-induced component',
    prescriptions: [
      { medication: 'Albuterol HFA Inhaler', dosage: '90 mcg/actuation', frequency: '2 puffs PRN prior to exertion', durationDays: 60 }
    ],
    clinicalNotes: 'Lung sounds reveal faint expiratory wheeze in bilateral lower lobes. Peak flow at 85% of personal best.',
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString()
  }
];

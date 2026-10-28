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

export interface PatientDetailResponse {
  patient: Patient;
  appointments: any[];
  encounters: any[];
}

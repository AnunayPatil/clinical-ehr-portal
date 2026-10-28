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

export interface DynamicFormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'textarea' | 'select' | 'date';
  placeholder?: string;
  options?: { value: string; label: string }[];
  defaultValue?: any;
  required?: boolean;
  min?: number;
  max?: number;
  gridSpan?: number; // CSS grid column span (e.g. 1 or 2)
  helpText?: string;
}

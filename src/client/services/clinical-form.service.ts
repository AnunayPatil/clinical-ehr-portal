import { Injectable, AppInjector } from '../core/di-container.js';
import { HttpService } from './http.service.js';
import { FormGroup, FormControl, Validators, ClinicalValidators } from '../core/validator.js';
import { DynamicFormField, Encounter } from '../models/clinical.model.js';
import { BehaviorSubject, Observable } from '../core/event-bus.js';

@Injectable({ providedIn: 'root' })
export class ClinicalFormService {
  private encountersSubject = new BehaviorSubject<Encounter[]>([]);

  constructor() {}

  private get http(): HttpService {
    return AppInjector.get(HttpService);
  }

  public get encounters$(): Observable<Encounter[]> {
    return this.encountersSubject.asObservable();
  }

  /**
   * Generates dynamic form schema definitions for clinical encounters
   */
  public getClinicalFormSchema(): DynamicFormField[] {
    return [
      {
        name: 'patientId',
        label: 'Select Patient',
        type: 'select',
        required: true,
        gridSpan: 1,
        helpText: 'Select patient for clinical documentation'
      },
      {
        name: 'providerName',
        label: 'Attending Physician',
        type: 'text',
        required: true,
        defaultValue: 'Dr. Rajesh Gupta',
        gridSpan: 1
      },
      {
        name: 'chiefComplaint',
        label: 'Chief Complaint (Subjective)',
        type: 'textarea',
        required: true,
        placeholder: 'Patient describes acute symptoms, duration, severity...',
        gridSpan: 2
      },
      {
        name: 'systolic',
        label: 'Systolic BP (mmHg)',
        type: 'number',
        required: true,
        defaultValue: 120,
        min: 60,
        max: 240,
        gridSpan: 1,
        helpText: 'Normal range: 90 - 120 mmHg'
      },
      {
        name: 'diastolic',
        label: 'Diastolic BP (mmHg)',
        type: 'number',
        required: true,
        defaultValue: 80,
        min: 35,
        max: 150,
        gridSpan: 1,
        helpText: 'Normal range: 60 - 80 mmHg'
      },
      {
        name: 'pulse',
        label: 'Heart Rate / Pulse (bpm)',
        type: 'number',
        required: true,
        defaultValue: 72,
        min: 30,
        max: 220,
        gridSpan: 1,
        helpText: 'Resting pulse: 60 - 100 bpm'
      },
      {
        name: 'temperature',
        label: 'Body Temperature (°F)',
        type: 'number',
        required: true,
        defaultValue: 98.6,
        min: 92,
        max: 108,
        gridSpan: 1
      },
      {
        name: 'o2Saturation',
        label: 'O2 Saturation (%)',
        type: 'number',
        required: true,
        defaultValue: 98,
        min: 70,
        max: 100,
        gridSpan: 1
      },
      {
        name: 'bloodGlucose',
        label: 'Blood Glucose (mg/dL)',
        type: 'number',
        required: false,
        defaultValue: 105,
        gridSpan: 1,
        helpText: 'Fasting / Post-prandial'
      },
      {
        name: 'diagnosis',
        label: 'Clinical Assessment & Diagnosis (ICD-10)',
        type: 'text',
        required: true,
        placeholder: 'e.g. Essential (primary) hypertension, Stage 1 (I10)',
        gridSpan: 2
      },
      {
        name: 'clinicalNotes',
        label: 'Care Plan & Clinical Narrative (Plan)',
        type: 'textarea',
        required: false,
        placeholder: 'Detailed therapeutic plan, lifestyle advice, follow-up intervals...',
        gridSpan: 2
      }
    ];
  }

  /**
   * Builds an Angular-style FormGroup with attached ClinicalValidators
   */
  public createReactiveFormGroup(): FormGroup {
    return new FormGroup({
      patientId: new FormControl('', [Validators.required]),
      providerName: new FormControl('Dr. Rajesh Gupta', [Validators.required, Validators.minLength(3)]),
      chiefComplaint: new FormControl('', [Validators.required, Validators.minLength(5)]),
      systolic: new FormControl(120, [Validators.required, ClinicalValidators.systolic()]),
      diastolic: new FormControl(80, [Validators.required, ClinicalValidators.diastolic()]),
      pulse: new FormControl(72, [Validators.required, ClinicalValidators.pulse()]),
      temperature: new FormControl(98.6, [Validators.required, ClinicalValidators.temperature()]),
      o2Saturation: new FormControl(98, [Validators.required, ClinicalValidators.o2Saturation()]),
      bloodGlucose: new FormControl(105),
      diagnosis: new FormControl('', [Validators.required, Validators.minLength(4)]),
      clinicalNotes: new FormControl('')
    });
  }

  public async fetchEncounters(patientId?: number): Promise<Encounter[]> {
    const params: Record<string, string> = {};
    if (patientId) params.patientId = String(patientId);

    const res = await this.http.get<Encounter[]>('/encounters', params);
    if (res.success && Array.isArray(res.data)) {
      this.encountersSubject.next(res.data);
      return res.data;
    }
    return [];
  }

  public async saveEncounter(formData: Record<string, any>): Promise<{ success: boolean; data?: Encounter; error?: string }> {
    const payload = {
      patientId: Number(formData.patientId),
      providerName: formData.providerName,
      chiefComplaint: formData.chiefComplaint,
      vitals: {
        systolic: Number(formData.systolic),
        diastolic: Number(formData.diastolic),
        pulse: Number(formData.pulse),
        temperature: Number(formData.temperature),
        o2Saturation: Number(formData.o2Saturation),
        bloodGlucose: formData.bloodGlucose ? Number(formData.bloodGlucose) : undefined
      },
      diagnosis: formData.diagnosis,
      prescriptions: [],
      clinicalNotes: formData.clinicalNotes
    };

    const res = await this.http.post<Encounter>('/encounters', payload);
    if (res.success && res.data) {
      await this.fetchEncounters();
      return { success: true, data: res.data };
    }
    return { success: false, error: res.error || 'Failed to record encounter' };
  }
}

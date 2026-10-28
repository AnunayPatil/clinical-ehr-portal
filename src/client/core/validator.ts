/**
 * Angular Reactive Forms Pattern Implementation
 * Provides AbstractControl, FormControl, FormGroup, and Clinical Validators
 * Implements client-side input validation and dirty/touched state tracking
 */

export type ValidationErrors = Record<string, any>;
export type ValidatorFn = (control: FormControl) => ValidationErrors | null;

export class FormControl {
  private _value: any;
  private _errors: ValidationErrors | null = null;
  private _dirty = false;
  private _touched = false;

  constructor(
    initialValue: any = '',
    private validators: ValidatorFn[] = []
  ) {
    this._value = initialValue;
    this.updateValueAndValidity();
  }

  get value(): any {
    return this._value;
  }

  get errors(): ValidationErrors | null {
    return this._errors;
  }

  get valid(): boolean {
    return this._errors === null;
  }

  get invalid(): boolean {
    return !this.valid;
  }

  get dirty(): boolean {
    return this._dirty;
  }

  get touched(): boolean {
    return this._touched;
  }

  setValue(value: any, options: { markDirty?: boolean } = { markDirty: true }): void {
    this._value = value;
    if (options.markDirty) {
      this._dirty = true;
    }
    this.updateValueAndValidity();
  }

  markAsTouched(): void {
    this._touched = true;
  }

  markAsDirty(): void {
    this._dirty = true;
  }

  reset(defaultValue: any = ''): void {
    this._value = defaultValue;
    this._dirty = false;
    this._touched = false;
    this.updateValueAndValidity();
  }

  updateValueAndValidity(): void {
    let combinedErrors: ValidationErrors | null = null;

    for (const validator of this.validators) {
      const error = validator(this);
      if (error) {
        combinedErrors = { ...(combinedErrors || {}), ...error };
      }
    }

    this._errors = combinedErrors;
  }
}

export class FormGroup {
  constructor(public controls: Record<string, FormControl>) {}

  get value(): Record<string, any> {
    const val: Record<string, any> = {};
    for (const key in this.controls) {
      val[key] = this.controls[key].value;
    }
    return val;
  }

  get valid(): boolean {
    return Object.values(this.controls).every(control => control.valid);
  }

  get invalid(): boolean {
    return !this.valid;
  }

  get errors(): Record<string, ValidationErrors | null> {
    const errors: Record<string, ValidationErrors | null> = {};
    for (const key in this.controls) {
      if (this.controls[key].errors) {
        errors[key] = this.controls[key].errors;
      }
    }
    return errors;
  }

  get(controlName: string): FormControl | undefined {
    return this.controls[controlName];
  }

  markAllAsTouched(): void {
    for (const key in this.controls) {
      this.controls[key].markAsTouched();
    }
  }

  reset(): void {
    for (const key in this.controls) {
      this.controls[key].reset();
    }
  }
}

// Built-in Angular-style Validators
export class Validators {
  static required(control: FormControl): ValidationErrors | null {
    const val = control.value;
    if (val === null || val === undefined || (typeof val === 'string' && val.trim() === '')) {
      return { required: 'This field is required for clinical records.' };
    }
    return null;
  }

  static minLength(length: number): ValidatorFn {
    return (control: FormControl): ValidationErrors | null => {
      const val = control.value;
      if (val && typeof val === 'string' && val.trim().length < length) {
        return { minLength: `Must be at least ${length} characters.` };
      }
      return null;
    };
  }

  static min(minValue: number): ValidatorFn {
    return (control: FormControl): ValidationErrors | null => {
      const num = Number(control.value);
      if (!isNaN(num) && num < minValue) {
        return { min: `Value cannot be less than ${minValue}.` };
      }
      return null;
    };
  }

  static max(maxValue: number): ValidatorFn {
    return (control: FormControl): ValidationErrors | null => {
      const num = Number(control.value);
      if (!isNaN(num) && num > maxValue) {
        return { max: `Value cannot exceed ${maxValue}.` };
      }
      return null;
    };
  }

  static pattern(regex: RegExp, errorMsg: string): ValidatorFn {
    return (control: FormControl): ValidationErrors | null => {
      if (!control.value) return null;
      if (!regex.test(String(control.value))) {
        return { pattern: errorMsg };
      }
      return null;
    };
  }
}

// Healthcare & Clinical domain specific validators
export class ClinicalValidators {
  /** Systolic Blood Pressure physiological validation (60 - 240 mmHg) */
  static systolic(): ValidatorFn {
    return (control: FormControl): ValidationErrors | null => {
      const val = Number(control.value);
      if (isNaN(val) || val <= 0) return null;
      if (val < 60 || val > 240) {
        return { systolicBoundary: `Systolic BP must be between 60 and 240 mmHg (entered: ${val}).` };
      }
      return null;
    };
  }

  /** Diastolic Blood Pressure physiological validation (35 - 150 mmHg) */
  static diastolic(): ValidatorFn {
    return (control: FormControl): ValidationErrors | null => {
      const val = Number(control.value);
      if (isNaN(val) || val <= 0) return null;
      if (val < 35 || val > 150) {
        return { diastolicBoundary: `Diastolic BP must be between 35 and 150 mmHg (entered: ${val}).` };
      }
      return null;
    };
  }

  /** Heart rate / Pulse validation (30 - 220 bpm) */
  static pulse(): ValidatorFn {
    return (control: FormControl): ValidationErrors | null => {
      const val = Number(control.value);
      if (isNaN(val) || val <= 0) return null;
      if (val < 30 || val > 220) {
        return { pulseBoundary: `Pulse rate must be between 30 and 220 bpm (entered: ${val}).` };
      }
      return null;
    };
  }

  /** Body Temperature (92.0 - 108.0 °F) */
  static temperature(): ValidatorFn {
    return (control: FormControl): ValidationErrors | null => {
      const val = Number(control.value);
      if (isNaN(val) || val <= 0) return null;
      if (val < 92.0 || val > 108.0) {
        return { tempBoundary: `Temperature must be between 92.0°F and 108.0°F (entered: ${val}).` };
      }
      return null;
    };
  }

  /** Oxygen Saturation SpO2 (70 - 100%) */
  static o2Saturation(): ValidatorFn {
    return (control: FormControl): ValidationErrors | null => {
      const val = Number(control.value);
      if (isNaN(val) || val <= 0) return null;
      if (val < 70 || val > 100) {
        return { o2Boundary: `Oxygen saturation must be between 70% and 100% (entered: ${val}).` };
      }
      return null;
    };
  }
}

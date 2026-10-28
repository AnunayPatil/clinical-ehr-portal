/**
 * Angular Reactive Forms Pattern Implementation
 * Provides AbstractControl, FormControl, FormGroup, and Clinical Validators
 * Implements client-side input validation and dirty/touched state tracking
 */
export class FormControl {
    validators;
    _value;
    _errors = null;
    _dirty = false;
    _touched = false;
    constructor(initialValue = '', validators = []) {
        this.validators = validators;
        this._value = initialValue;
        this.updateValueAndValidity();
    }
    get value() {
        return this._value;
    }
    get errors() {
        return this._errors;
    }
    get valid() {
        return this._errors === null;
    }
    get invalid() {
        return !this.valid;
    }
    get dirty() {
        return this._dirty;
    }
    get touched() {
        return this._touched;
    }
    setValue(value, options = { markDirty: true }) {
        this._value = value;
        if (options.markDirty) {
            this._dirty = true;
        }
        this.updateValueAndValidity();
    }
    markAsTouched() {
        this._touched = true;
    }
    markAsDirty() {
        this._dirty = true;
    }
    reset(defaultValue = '') {
        this._value = defaultValue;
        this._dirty = false;
        this._touched = false;
        this.updateValueAndValidity();
    }
    updateValueAndValidity() {
        let combinedErrors = null;
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
    controls;
    constructor(controls) {
        this.controls = controls;
    }
    get value() {
        const val = {};
        for (const key in this.controls) {
            val[key] = this.controls[key].value;
        }
        return val;
    }
    get valid() {
        return Object.values(this.controls).every(control => control.valid);
    }
    get invalid() {
        return !this.valid;
    }
    get errors() {
        const errors = {};
        for (const key in this.controls) {
            if (this.controls[key].errors) {
                errors[key] = this.controls[key].errors;
            }
        }
        return errors;
    }
    get(controlName) {
        return this.controls[controlName];
    }
    markAllAsTouched() {
        for (const key in this.controls) {
            this.controls[key].markAsTouched();
        }
    }
    reset() {
        for (const key in this.controls) {
            this.controls[key].reset();
        }
    }
}
// Built-in Angular-style Validators
export class Validators {
    static required(control) {
        const val = control.value;
        if (val === null || val === undefined || (typeof val === 'string' && val.trim() === '')) {
            return { required: 'This field is required for clinical records.' };
        }
        return null;
    }
    static minLength(length) {
        return (control) => {
            const val = control.value;
            if (val && typeof val === 'string' && val.trim().length < length) {
                return { minLength: `Must be at least ${length} characters.` };
            }
            return null;
        };
    }
    static min(minValue) {
        return (control) => {
            const num = Number(control.value);
            if (!isNaN(num) && num < minValue) {
                return { min: `Value cannot be less than ${minValue}.` };
            }
            return null;
        };
    }
    static max(maxValue) {
        return (control) => {
            const num = Number(control.value);
            if (!isNaN(num) && num > maxValue) {
                return { max: `Value cannot exceed ${maxValue}.` };
            }
            return null;
        };
    }
    static pattern(regex, errorMsg) {
        return (control) => {
            if (!control.value)
                return null;
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
    static systolic() {
        return (control) => {
            const val = Number(control.value);
            if (isNaN(val) || val <= 0)
                return null;
            if (val < 60 || val > 240) {
                return { systolicBoundary: `Systolic BP must be between 60 and 240 mmHg (entered: ${val}).` };
            }
            return null;
        };
    }
    /** Diastolic Blood Pressure physiological validation (35 - 150 mmHg) */
    static diastolic() {
        return (control) => {
            const val = Number(control.value);
            if (isNaN(val) || val <= 0)
                return null;
            if (val < 35 || val > 150) {
                return { diastolicBoundary: `Diastolic BP must be between 35 and 150 mmHg (entered: ${val}).` };
            }
            return null;
        };
    }
    /** Heart rate / Pulse validation (30 - 220 bpm) */
    static pulse() {
        return (control) => {
            const val = Number(control.value);
            if (isNaN(val) || val <= 0)
                return null;
            if (val < 30 || val > 220) {
                return { pulseBoundary: `Pulse rate must be between 30 and 220 bpm (entered: ${val}).` };
            }
            return null;
        };
    }
    /** Body Temperature (92.0 - 108.0 °F) */
    static temperature() {
        return (control) => {
            const val = Number(control.value);
            if (isNaN(val) || val <= 0)
                return null;
            if (val < 92.0 || val > 108.0) {
                return { tempBoundary: `Temperature must be between 92.0°F and 108.0°F (entered: ${val}).` };
            }
            return null;
        };
    }
    /** Oxygen Saturation SpO2 (70 - 100%) */
    static o2Saturation() {
        return (control) => {
            const val = Number(control.value);
            if (isNaN(val) || val <= 0)
                return null;
            if (val < 70 || val > 100) {
                return { o2Boundary: `Oxygen saturation must be between 70% and 100% (entered: ${val}).` };
            }
            return null;
        };
    }
}

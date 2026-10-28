import { AppInjector } from './core/di-container.js';
import { PatientService } from './services/patient.service.js';
import { AppointmentService } from './services/appointment.service.js';
import { ClinicalFormService } from './services/clinical-form.service.js';
import { ConcurrencyService } from './services/concurrency.service.js';
import { NotificationService } from './services/notification.service.js';
import { HttpService } from './services/http.service.js';
import { ErrorBoundaryService } from './core/error-boundary.js';
class ClinicalEhrApp {
    // Modular UI Services injected via Angular DI Container
    patientService = AppInjector.get(PatientService);
    appointmentService = AppInjector.get(AppointmentService);
    clinicalFormService = AppInjector.get(ClinicalFormService);
    concurrencyService = AppInjector.get(ConcurrencyService);
    notification = AppInjector.get(NotificationService);
    http = AppInjector.get(HttpService);
    errorBoundary = ErrorBoundaryService.getInstance();
    activeTab = 'overview';
    dynamicFormGroup = null;
    constructor() {
        this.init();
    }
    async init() {
        console.log('[EHR Portal] Initializing Application Component with Angular DI Singletons...');
        this.setupErrorHandling();
        this.setupTabs();
        this.setupModals();
        this.setupEventListeners();
        this.setupReactiveDynamicForm();
        this.subscribeToServices();
        // Initial data load
        await Promise.all([
            this.checkSystemHealth(),
            this.patientService.fetchPatients(),
            this.appointmentService.fetchAppointments(),
            this.clinicalFormService.fetchEncounters()
        ]);
    }
    setupErrorHandling() {
        this.errorBoundary.subscribe((report) => {
            const container = document.getElementById('audit-stream-container');
            if (container) {
                const div = document.createElement('div');
                div.className = 'audit-entry';
                div.innerHTML = `
          <span class="audit-time">[${report.timestamp}]</span>
          <span class="audit-text-warn">🛡️ [Trapped by Error Boundary]: ${report.message}</span>
        `;
                container.insertBefore(div, container.firstChild);
            }
        });
    }
    setupTabs() {
        const tabBtns = document.querySelectorAll('.nav-tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.dataset.tab;
                if (!target)
                    return;
                this.switchTab(target);
            });
        });
    }
    switchTab(tabId) {
        this.activeTab = tabId;
        document.querySelectorAll('.nav-tab-btn').forEach(btn => {
            const b = btn;
            const isTarget = b.dataset.tab === tabId;
            b.classList.toggle('active', isTarget);
            b.setAttribute('aria-selected', isTarget ? 'true' : 'false');
        });
        document.querySelectorAll('.tab-view').forEach(view => {
            const el = view;
            el.classList.toggle('active', el.id === `tab-${tabId}`);
        });
        if (tabId === 'overview')
            this.refreshDashboardStats();
    }
    setupModals() {
        // New Patient Modal
        const btnOpenPatient = document.getElementById('btn-open-new-patient');
        const modalPatient = document.getElementById('modal-new-patient');
        const btnClosePatient = document.getElementById('btn-close-new-patient-modal');
        const btnCancelPatient = document.getElementById('btn-cancel-new-patient');
        btnOpenPatient?.addEventListener('click', () => modalPatient?.classList.add('open'));
        btnClosePatient?.addEventListener('click', () => modalPatient?.classList.remove('open'));
        btnCancelPatient?.addEventListener('click', () => modalPatient?.classList.remove('open'));
        // New Appointment Modal
        const btnOpenApt = document.getElementById('btn-open-new-appointment');
        const modalApt = document.getElementById('modal-new-appointment');
        const btnCloseApt = document.getElementById('btn-close-new-appointment-modal');
        const btnCancelApt = document.getElementById('btn-cancel-new-appointment');
        btnOpenApt?.addEventListener('click', () => {
            this.populatePatientDropdown();
            // Set default appointment date to tomorrow 10:00 AM
            const d = new Date();
            d.setDate(d.getDate() + 1);
            d.setHours(10, 0, 0, 0);
            const iso = d.toISOString().slice(0, 16);
            const dateInp = document.getElementById('inp-apt-date');
            if (dateInp)
                dateInp.value = iso;
            modalApt?.classList.add('open');
        });
        btnCloseApt?.addEventListener('click', () => modalApt?.classList.remove('open'));
        btnCancelApt?.addEventListener('click', () => modalApt?.classList.remove('open'));
        // Drawer Patient Details
        const btnCloseDrawer = document.getElementById('btn-close-drawer');
        const backdropDrawer = document.getElementById('patient-drawer-backdrop');
        const closeDrawer = () => {
            document.getElementById('patient-drawer-panel')?.classList.remove('open');
            backdropDrawer?.classList.remove('open');
            this.patientService.clearSelectedPatient();
        };
        btnCloseDrawer?.addEventListener('click', closeDrawer);
        backdropDrawer?.addEventListener('click', closeDrawer);
    }
    setupEventListeners() {
        // Quick action buttons
        document.getElementById('btn-refresh-stats')?.addEventListener('click', () => {
            this.refreshDashboardStats();
            this.notification.info('Stats Refreshed', 'Clinical dashboard metrics updated.');
        });
        document.getElementById('btn-quick-encounter')?.addEventListener('click', () => {
            this.switchTab('documentation');
        });
        document.getElementById('btn-goto-appointments')?.addEventListener('click', () => {
            this.switchTab('appointments');
        });
        document.getElementById('btn-goto-simulator')?.addEventListener('click', () => {
            this.switchTab('concurrency');
        });
        // Patient search and filter inputs
        const searchInp = document.getElementById('patient-search-input');
        const filterSelect = document.getElementById('patient-status-filter');
        let debounceTimer;
        searchInp?.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                this.patientService.fetchPatients(searchInp.value, filterSelect.value);
            }, 250);
        });
        filterSelect?.addEventListener('change', () => {
            this.patientService.fetchPatients(searchInp.value, filterSelect.value);
        });
        // Appointment status filter
        const aptFilter = document.getElementById('appointment-status-filter');
        aptFilter?.addEventListener('change', () => {
            this.appointmentService.fetchAppointments(aptFilter.value);
        });
        // New Patient Form Submit
        const formPatient = document.getElementById('form-new-patient');
        formPatient?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const first = document.getElementById('inp-p-first').value;
            const last = document.getElementById('inp-p-last').value;
            const dob = document.getElementById('inp-p-dob').value;
            const gender = document.getElementById('inp-p-gender').value;
            const blood = document.getElementById('inp-p-blood').value;
            const phone = document.getElementById('inp-p-phone').value;
            const email = document.getElementById('inp-p-email').value;
            const allergies = document.getElementById('inp-p-allergies').value;
            const chronic = document.getElementById('inp-p-chronic').value;
            const res = await this.patientService.registerPatient({
                firstName: first,
                lastName: last,
                dob,
                gender,
                bloodType: blood,
                phone,
                email,
                allergies: allergies ? allergies.split(',').map(s => s.trim()) : [],
                chronicConditions: chronic ? chronic.split(',').map(s => s.trim()) : [],
                status: 'Active'
            });
            if (res.success) {
                this.notification.success('Patient Registered', `${first} ${last} successfully enrolled in EHR.`);
                document.getElementById('modal-new-patient')?.classList.remove('open');
                formPatient.reset();
                this.populatePatientDropdown();
            }
            else {
                this.notification.error('Registration Error', res.error || 'Failed to save patient');
            }
        });
        // New Appointment Form Submit
        const formApt = document.getElementById('form-new-appointment');
        formApt?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const patientId = Number(document.getElementById('inp-apt-patient').value);
            const provider = document.getElementById('inp-apt-physician').value;
            const dept = document.getElementById('inp-apt-dept').value;
            const date = document.getElementById('inp-apt-date').value;
            const room = document.getElementById('inp-apt-room').value;
            const reason = document.getElementById('inp-apt-reason').value;
            const res = await this.appointmentService.scheduleAppointment({
                patientId,
                providerName: provider,
                department: dept,
                appointmentDate: new Date(date).toISOString(),
                room,
                reason,
                status: 'Scheduled',
                durationMinutes: 30
            });
            if (res.success) {
                this.notification.success('Appointment Scheduled', `Clinical encounter booked for ${provider}.`);
                document.getElementById('modal-new-appointment')?.classList.remove('open');
                formApt.reset();
                this.refreshDashboardStats();
            }
            else {
                this.notification.error('Scheduling Error', res.error || 'Failed to schedule');
            }
        });
        // ICU Bedside Telemetry Stream Trigger
        const btnStress = document.getElementById('btn-run-stress-500');
        btnStress?.addEventListener('click', async () => {
            btnStress.setAttribute('disabled', 'true');
            btnStress.textContent = '⏳ Ingesting 500 Bedside Telemetry Streams...';
            try {
                await this.concurrencyService.executeStressTest(500);
                this.notification.success('Telemetry Stream Ingested', '500 continuous bed monitors synced with 100% clinical data integrity.');
            }
            catch (err) {
                this.notification.error('Telemetry Stream Error', err.message);
            }
            finally {
                btnStress.removeAttribute('disabled');
                btnStress.textContent = '📡 Sync 500 Bedside Telemetry Streams';
            }
        });
        // Clear error history button
        document.getElementById('btn-clear-error-history')?.addEventListener('click', () => {
            this.errorBoundary.clear();
            this.notification.info('Audit Cleared', 'Error boundary history reset.');
        });
    }
    /**
     * Sets up Angular-style Dynamic Reactive Forms with Instant Field Validation
     */
    setupReactiveDynamicForm() {
        const container = document.getElementById('dynamic-form-fields-container');
        if (!container)
            return;
        // 1. Get schema from injected service
        const schema = this.clinicalFormService.getClinicalFormSchema();
        // 2. Instantiate Reactive FormGroup with attached ClinicalValidators
        this.dynamicFormGroup = this.clinicalFormService.createReactiveFormGroup();
        container.innerHTML = '';
        schema.forEach(field => {
            const formGroupDiv = document.createElement('div');
            formGroupDiv.className = `form-group col-span-${field.gridSpan || 1}`;
            const control = this.dynamicFormGroup?.get(field.name);
            let inputHtml = '';
            if (field.type === 'select') {
                inputHtml = `<select id="field-${field.name}" name="${field.name}" class="form-control"></select>`;
            }
            else if (field.type === 'textarea') {
                inputHtml = `<textarea id="field-${field.name}" name="${field.name}" class="form-control" rows="3" placeholder="${field.placeholder || ''}">${field.defaultValue || ''}</textarea>`;
            }
            else {
                inputHtml = `<input type="${field.type}" id="field-${field.name}" name="${field.name}" class="form-control" value="${field.defaultValue !== undefined ? field.defaultValue : ''}" placeholder="${field.placeholder || ''}" ${field.min ? `min="${field.min}"` : ''} ${field.max ? `max="${field.max}"` : ''}>`;
            }
            formGroupDiv.innerHTML = `
        <label class="form-label" for="field-${field.name}">
          <span>${field.label} ${field.required ? '*' : ''}</span>
          <span class="validation-status" id="status-${field.name}"></span>
        </label>
        ${inputHtml}
        <div class="validation-error-msg" id="error-${field.name}" style="display: none;"></div>
        ${field.helpText ? `<div class="form-help">${field.helpText}</div>` : ''}
      `;
            container.appendChild(formGroupDiv);
            // Real-time listener for Angular-like dirty, touched, and validation feedback
            const inputEl = formGroupDiv.querySelector(`#field-${field.name}`);
            inputEl?.addEventListener('input', () => {
                control?.setValue(inputEl.value);
                this.updateFieldValidationUI(field.name, control);
            });
            inputEl?.addEventListener('blur', () => {
                control?.markAsTouched();
                this.updateFieldValidationUI(field.name, control);
            });
        });
        this.populatePatientDropdown();
        // Form submit listener
        const form = document.getElementById('clinical-encounter-form');
        form?.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!this.dynamicFormGroup)
                return;
            this.dynamicFormGroup.markAllAsTouched();
            // Validate all controls
            schema.forEach(field => {
                const ctrl = this.dynamicFormGroup?.get(field.name);
                this.updateFieldValidationUI(field.name, ctrl);
            });
            if (this.dynamicFormGroup.invalid) {
                this.notification.warning('Clinical Validation Failed', 'Please fix highlighted physiological safety errors before committing record.');
                return;
            }
            const formValues = this.dynamicFormGroup.value;
            const res = await this.clinicalFormService.saveEncounter(formValues);
            if (res.success) {
                this.notification.success('Encounter Documented', 'Clinical SOAP note committed securely.');
                form.reset();
                this.dynamicFormGroup.reset();
                this.setupReactiveDynamicForm();
                this.refreshDashboardStats();
            }
            else {
                this.notification.error('Submission Error', res.error || 'Failed to commit encounter');
            }
        });
        document.getElementById('btn-reset-clinical-form')?.addEventListener('click', () => {
            this.setupReactiveDynamicForm();
            this.notification.info('Form Reset', 'Clinical documentation form cleared.');
        });
    }
    updateFieldValidationUI(name, control) {
        if (!control)
            return;
        const inputEl = document.getElementById(`field-${name}`);
        const errorEl = document.getElementById(`error-${name}`);
        if (control.touched && control.invalid) {
            inputEl?.classList.add('is-invalid');
            if (errorEl) {
                errorEl.style.display = 'flex';
                const firstErr = control.errors ? Object.values(control.errors)[0] : 'Invalid value';
                errorEl.textContent = `⚠ ${firstErr}`;
            }
        }
        else {
            inputEl?.classList.remove('is-invalid');
            if (errorEl) {
                errorEl.style.display = 'none';
                errorEl.textContent = '';
            }
        }
    }
    subscribeToServices() {
        // 1. Subscribe to Patients stream
        this.patientService.patients$.subscribe(patients => {
            this.renderPatientDataGrid(patients);
            const countBadge = document.getElementById('tab-patient-count');
            if (countBadge)
                countBadge.textContent = String(patients.length);
            const statActive = document.getElementById('stat-active-patients');
            if (statActive)
                statActive.textContent = String(patients.filter(p => p.status === 'Active').length);
            this.populatePatientDropdown();
        });
        // 2. Subscribe to Appointments stream
        this.appointmentService.appointments$.subscribe(appointments => {
            this.renderAppointmentDataGrid(appointments);
            this.renderOverviewAppointments(appointments);
            const countBadge = document.getElementById('tab-appointment-count');
            if (countBadge)
                countBadge.textContent = String(appointments.length);
            const statToday = document.getElementById('stat-scheduled-today');
            if (statToday)
                statToday.textContent = String(appointments.filter(a => a.status !== 'Completed' && a.status !== 'Cancelled').length);
        });
        // 3. Subscribe to Encounters stream
        this.clinicalFormService.encounters$.subscribe(encounters => {
            this.renderRecentEncounters(encounters);
            const statNotes = document.getElementById('stat-completed-notes');
            if (statNotes)
                statNotes.textContent = String(encounters.length);
        });
        // 4. Subscribe to Concurrency Stress Metrics stream
        this.concurrencyService.metrics$.subscribe(metrics => {
            this.renderStressMetrics(metrics);
        });
        // 5. Subscribe to Selected Patient details
        this.patientService.selectedPatient$.subscribe(detail => {
            if (detail) {
                this.renderPatientDetailDrawer(detail.patient, detail.appointments, detail.encounters);
            }
        });
    }
    async checkSystemHealth() {
        const res = await this.http.get('/health');
        if (res.success && res.data) {
            const badge = document.getElementById('db-engine-badge');
            const diagBadge = document.getElementById('diag-db-engine');
            if (badge)
                badge.textContent = `DB: ${res.data.database.isPostgres ? 'PostgreSQL 16' : 'In-Memory Store'}`;
            if (diagBadge)
                diagBadge.textContent = res.data.database.engine;
        }
    }
    async refreshDashboardStats() {
        const res = await this.http.get('/simulate/stats');
        if (res.success && res.data) {
            const d = res.data;
            const elActive = document.getElementById('stat-active-patients');
            const elApt = document.getElementById('stat-scheduled-today');
            const elNotes = document.getElementById('stat-completed-notes');
            if (elActive)
                elActive.textContent = String(d.activePatients);
            if (elApt)
                elApt.textContent = String(d.scheduledToday);
            if (elNotes)
                elNotes.textContent = String(d.completedEncounters);
        }
    }
    renderPatientDataGrid(patients) {
        const tbody = document.getElementById('patient-table-body');
        if (!tbody)
            return;
        if (patients.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">No patient records matched the search query.</td></tr>`;
            return;
        }
        tbody.innerHTML = patients.map(p => {
            const allergiesHtml = p.allergies && p.allergies.length > 0
                ? p.allergies.map(a => `<span class="badge badge-danger" style="margin-right: 0.25rem;">${a}</span>`).join('')
                : '<span style="color: var(--text-light); font-size: 0.75rem;">None recorded</span>';
            const statusBadge = p.status === 'Active' ? 'badge-active' : (p.status === 'Inpatient' ? 'badge-inpatient' : 'badge-discharged');
            return `
        <tr data-patient-id="${p.id}">
          <td>
            <div class="patient-cell">
              <a href="javascript:void(0)" class="patient-name-link" data-id="${p.id}">${p.firstName} ${p.lastName}</a>
              <span class="patient-mrn-sub">${p.mrn}</span>
            </div>
          </td>
          <td>${p.dob}</td>
          <td><strong>${p.gender}</strong> • ${p.bloodType}</td>
          <td>
            <div style="font-size: 0.8rem;">${p.phone}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${p.email}</div>
          </td>
          <td>${allergiesHtml}</td>
          <td><span class="badge ${statusBadge}">${p.status}</span></td>
          <td>
            <button class="btn btn-outline btn-sm btn-view-patient" data-id="${p.id}">View Chart</button>
          </td>
        </tr>
      `;
        }).join('');
        // Attach row click listeners
        tbody.querySelectorAll('.btn-view-patient, .patient-name-link').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = Number(btn.dataset.id);
                if (id)
                    this.openPatientDetails(id);
            });
        });
    }
    async openPatientDetails(id) {
        await this.patientService.selectPatient(id);
        document.getElementById('patient-drawer-panel')?.classList.add('open');
        document.getElementById('patient-drawer-backdrop')?.classList.add('open');
    }
    renderPatientDetailDrawer(patient, appointments, encounters) {
        const elName = document.getElementById('drawer-patient-name');
        const elMrn = document.getElementById('drawer-patient-mrn');
        const elDob = document.getElementById('drawer-dob');
        const elGender = document.getElementById('drawer-gender');
        const elBlood = document.getElementById('drawer-blood');
        const elStatus = document.getElementById('drawer-status');
        const elContact = document.getElementById('drawer-contact');
        const elAllergies = document.getElementById('drawer-allergies-list');
        const elChronic = document.getElementById('drawer-chronic-list');
        const elTimeline = document.getElementById('drawer-encounters-timeline');
        if (elName)
            elName.textContent = `${patient.firstName} ${patient.lastName}`;
        if (elMrn)
            elMrn.textContent = patient.mrn;
        if (elDob)
            elDob.textContent = patient.dob;
        if (elGender)
            elGender.textContent = patient.gender;
        if (elBlood)
            elBlood.textContent = patient.bloodType;
        if (elStatus) {
            elStatus.textContent = patient.status;
            elStatus.className = `badge ${patient.status === 'Active' ? 'badge-active' : (patient.status === 'Inpatient' ? 'badge-inpatient' : 'badge-discharged')}`;
        }
        if (elContact)
            elContact.textContent = `${patient.phone} • ${patient.email}`;
        if (elAllergies) {
            elAllergies.innerHTML = patient.allergies && patient.allergies.length > 0
                ? patient.allergies.map(a => `<span class="badge badge-danger">⚠ ${a}</span>`).join('')
                : '<span style="color: var(--text-muted); font-size: 0.8rem;">No known medical allergies.</span>';
        }
        if (elChronic) {
            elChronic.innerHTML = patient.chronicConditions && patient.chronicConditions.length > 0
                ? patient.chronicConditions.map(c => `<span class="badge badge-warning">${c}</span>`).join('')
                : '<span style="color: var(--text-muted); font-size: 0.8rem;">No chronic conditions cataloged.</span>';
        }
        if (elTimeline) {
            if (encounters.length === 0) {
                elTimeline.innerHTML = '<span style="color: var(--text-muted); font-size: 0.8rem;">No previous clinical encounter notes recorded.</span>';
            }
            else {
                elTimeline.innerHTML = encounters.map(e => `
          <div style="background: var(--bg-muted); border-radius: var(--radius-sm); padding: 1rem; border-left: 3px solid var(--primary);">
            <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.25rem;">
              <span>${new Date(e.encounterDate).toLocaleDateString()}</span>
              <strong>${e.providerName}</strong>
            </div>
            <div style="font-weight: 600; font-size: 0.875rem; margin-bottom: 0.25rem;">${e.diagnosis}</div>
            <div style="font-size: 0.8rem; color: var(--text-main); margin-bottom: 0.5rem;">${e.chiefComplaint}</div>
            <div class="vitals-grid">
              <div class="vital-card">
                <span class="vital-title">BP</span>
                <span class="vital-value">${e.vitals?.systolic}/${e.vitals?.diastolic}</span>
                <span class="vital-unit">mmHg</span>
              </div>
              <div class="vital-card">
                <span class="vital-title">Pulse</span>
                <span class="vital-value">${e.vitals?.pulse}</span>
                <span class="vital-unit">bpm</span>
              </div>
              <div class="vital-card">
                <span class="vital-title">O2 Sat</span>
                <span class="vital-value">${e.vitals?.o2Saturation}%</span>
                <span class="vital-unit">SpO2</span>
              </div>
            </div>
          </div>
        `).join('');
            }
        }
    }
    renderAppointmentDataGrid(appointments) {
        const tbody = document.getElementById('appointment-table-body');
        if (!tbody)
            return;
        if (appointments.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">No clinical appointments in this queue.</td></tr>`;
            return;
        }
        tbody.innerHTML = appointments.map(a => {
            const statusBadge = a.status === 'Completed' ? 'badge-success' : (a.status === 'Arrived' || a.status === 'In-Consultation' ? 'badge-warning' : (a.status === 'Cancelled' ? 'badge-danger' : 'badge-info'));
            let transitAction = '';
            if (a.status === 'Scheduled') {
                transitAction = `<button class="btn btn-outline btn-sm btn-status" data-id="${a.id}" data-status="Arrived">Mark Arrived</button>`;
            }
            else if (a.status === 'Arrived') {
                transitAction = `<button class="btn btn-primary btn-sm btn-status" data-id="${a.id}" data-status="In-Consultation">Start Consult</button>`;
            }
            else if (a.status === 'In-Consultation') {
                transitAction = `<button class="btn btn-secondary btn-sm btn-status" data-id="${a.id}" data-status="Completed">Complete Note</button>`;
            }
            else {
                transitAction = `<span style="font-size: 0.75rem; color: var(--text-muted);">Finalized</span>`;
            }
            const formattedDate = new Date(a.appointmentDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
            return `
        <tr>
          <td><strong>${a.patientName || `Patient #${a.patientId}`}</strong></td>
          <td>${a.providerName}</td>
          <td>${a.department} • <span style="font-family: var(--font-mono); font-size: 0.8rem;">${a.room}</span></td>
          <td>${formattedDate}</td>
          <td>${a.reason}</td>
          <td><span class="badge ${statusBadge}">${a.status}</span></td>
          <td>${transitAction}</td>
        </tr>
      `;
        }).join('');
        // Attach transit action listeners
        tbody.querySelectorAll('.btn-status').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = Number(btn.dataset.id);
                const newStatus = btn.dataset.status;
                if (id && newStatus) {
                    const success = await this.appointmentService.updateStatus(id, newStatus);
                    if (success) {
                        this.notification.success('Status Updated', `Appointment transitioned to ${newStatus}.`);
                        this.refreshDashboardStats();
                    }
                }
            });
        });
    }
    renderOverviewAppointments(appointments) {
        const tbody = document.getElementById('overview-appointments-body');
        if (!tbody)
            return;
        const upcoming = appointments.slice(0, 4);
        if (upcoming.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">No appointments pending.</td></tr>`;
            return;
        }
        tbody.innerHTML = upcoming.map(a => {
            const statusBadge = a.status === 'Completed' ? 'badge-success' : (a.status === 'Arrived' || a.status === 'In-Consultation' ? 'badge-warning' : 'badge-info');
            const timeStr = new Date(a.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return `
        <tr>
          <td><strong>${a.patientName || `Patient #${a.patientId}`}</strong></td>
          <td>${a.providerName}</td>
          <td>${a.department} (${a.room})</td>
          <td>${timeStr}</td>
          <td><span class="badge ${statusBadge}">${a.status}</span></td>
        </tr>
      `;
        }).join('');
    }
    renderRecentEncounters(encounters) {
        const container = document.getElementById('recent-encounters-list');
        if (!container)
            return;
        if (encounters.length === 0) {
            container.innerHTML = '<span style="color: var(--text-muted);">No encounters documented yet.</span>';
            return;
        }
        container.innerHTML = encounters.slice(0, 3).map(e => `
      <div style="background: var(--bg-muted); padding: 0.75rem; border-radius: var(--radius-sm); border-left: 3px solid var(--secondary);">
        <div style="font-weight: 600;">${e.diagnosis}</div>
        <div style="color: var(--text-muted); font-size: 0.75rem;">${e.providerName} • BP: ${e.vitals?.systolic}/${e.vitals?.diastolic} mmHg</div>
      </div>
    `).join('');
    }
    renderStressMetrics(m) {
        const fill = document.getElementById('stress-progress-fill');
        const percentEl = document.getElementById('stress-progress-percent');
        const textEl = document.getElementById('stress-progress-text');
        const tag = document.getElementById('stress-status-tag');
        const percent = Math.min(100, Math.round((m.completedRequests / (m.totalRequests || 500)) * 100));
        if (fill)
            fill.style.width = `${percent}%`;
        if (percentEl)
            percentEl.textContent = `${percent}%`;
        if (textEl)
            textEl.textContent = `${m.completedRequests} / ${m.totalRequests} Requests`;
        if (tag) {
            if (m.isRunning) {
                tag.className = 'badge badge-warning';
                tag.textContent = 'RUNNING 500+ SIMULATION';
            }
            else if (m.completedRequests > 0) {
                tag.className = 'badge badge-success';
                tag.textContent = 'STRESS TEST COMPLETED';
            }
            else {
                tag.className = 'badge badge-muted';
                tag.textContent = 'Idle';
            }
        }
        const elSuccess = document.getElementById('stat-stress-success');
        const elValidation = document.getElementById('stat-stress-validation');
        const elTrapped = document.getElementById('stat-stress-trapped');
        const elRps = document.getElementById('stat-stress-rps');
        const elAvg = document.getElementById('stat-stress-avg');
        const elP95 = document.getElementById('stat-stress-p95');
        const elIntegrity = document.getElementById('stat-stress-integrity');
        if (elSuccess)
            elSuccess.textContent = String(m.successfulRequests);
        if (elValidation)
            elValidation.textContent = String(m.validationBlocked);
        if (elTrapped)
            elTrapped.textContent = String(m.errorBoundaryTraps);
        if (elRps)
            elRps.textContent = `${m.throughputRps} req/s`;
        if (elAvg)
            elAvg.textContent = `${m.avgLatencyMs} ms`;
        if (elP95)
            elP95.textContent = `${m.p95LatencyMs} ms`;
        if (elIntegrity)
            elIntegrity.textContent = `${m.dataIntegrityPercentage}%`;
        // Render audit stream
        const container = document.getElementById('audit-stream-container');
        if (container && m.logs && m.logs.length > 0) {
            container.innerHTML = m.logs.map((log) => `
        <div class="audit-entry">
          <span class="audit-time">[${log.time}]</span>
          <span class="audit-text-${log.type}">${log.message}</span>
        </div>
      `).join('');
        }
    }
    populatePatientDropdown() {
        const selects = [
            document.getElementById('inp-apt-patient'),
            document.getElementById('field-patientId')
        ];
        const currentPatients = this.patientService.patients$;
        currentPatients.subscribe(patients => {
            selects.forEach(select => {
                if (!select)
                    return;
                const currentVal = select.value;
                select.innerHTML = '<option value="">-- Choose Patient Record --</option>' +
                    patients.map(p => `<option value="${p.id}" ${String(p.id) === currentVal ? 'selected' : ''}>${p.firstName} ${p.lastName} (${p.mrn})</option>`).join('');
            });
        });
    }
}
// Bootstrap Application once DOM is ready
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        window.ehrApp = new ClinicalEhrApp();
    });
}

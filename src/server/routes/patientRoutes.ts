import { Router, Request, Response } from 'express';
import { getDatabase } from '../db.js';

const router = Router();

// GET /api/patients - Search and filter patient records
router.get('/', async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const query = typeof req.query.q === 'string' ? req.query.q : undefined;
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const patients = await db.getPatients(query, status);
    res.json({ success: true, count: patients.length, data: patients });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/patients/:id - Single patient with medical history, vitals, encounters
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid patient ID format' });
    }
    const result = await db.getPatientById(id);
    if (!result) {
      return res.status(404).json({ success: false, error: 'Patient record not found' });
    }
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/patients - Register a new patient
router.post('/', async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const { firstName, lastName, dob, gender, bloodType, phone, email, allergies, chronicConditions, status } = req.body;

    // Server-side validation
    if (!firstName || !lastName || !dob || !gender) {
      return res.status(400).json({
        success: false,
        error: 'Missing required clinical fields: firstName, lastName, dob, and gender are mandatory.'
      });
    }

    const newPatient = await db.createPatient({
      mrn: req.body.mrn || '',
      firstName,
      lastName,
      dob,
      gender,
      bloodType: bloodType || 'Unknown',
      phone: phone || '',
      email: email || '',
      allergies: Array.isArray(allergies) ? allergies : (allergies ? allergies.split(',').map((s: string) => s.trim()) : []),
      chronicConditions: Array.isArray(chronicConditions) ? chronicConditions : (chronicConditions ? chronicConditions.split(',').map((s: string) => s.trim()) : []),
      status: status || 'Active'
    });

    res.status(201).json({ success: true, message: 'Patient registered successfully', data: newPatient });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

import { Router, Request, Response } from 'express';
import { getDatabase } from '../db.js';

const router = Router();

// GET /api/encounters - List clinical encounter notes
router.get('/', async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const patientId = req.query.patientId ? parseInt(req.query.patientId as string, 10) : undefined;
    const encounters = await db.getEncounters(patientId);
    res.json({ success: true, count: encounters.length, data: encounters });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/encounters - Save a new clinical documentation encounter
router.post('/', async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const { patientId, providerName, encounterDate, chiefComplaint, vitals, diagnosis, prescriptions, clinicalNotes } = req.body;

    if (!patientId || !providerName || !chiefComplaint || !diagnosis) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed: patientId, providerName, chiefComplaint, and diagnosis are mandatory.'
      });
    }

    // Clinical validation for vital boundaries
    if (vitals) {
      if (vitals.systolic < 60 || vitals.systolic > 240) {
        return res.status(422).json({
          success: false,
          error: 'Clinical safety boundary exceeded: Systolic BP must be between 60 and 240 mmHg.'
        });
      }
      if (vitals.diastolic < 35 || vitals.diastolic > 150) {
        return res.status(422).json({
          success: false,
          error: 'Clinical safety boundary exceeded: Diastolic BP must be between 35 and 150 mmHg.'
        });
      }
    }

    const encounter = await db.createEncounter({
      patientId: Number(patientId),
      providerName,
      encounterDate: encounterDate || new Date().toISOString(),
      chiefComplaint,
      vitals: vitals || { systolic: 120, diastolic: 80, pulse: 72, temperature: 98.6, o2Saturation: 98 },
      diagnosis,
      prescriptions: Array.isArray(prescriptions) ? prescriptions : [],
      clinicalNotes: clinicalNotes || ''
    });

    res.status(201).json({ success: true, message: 'Clinical encounter logged', data: encounter });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

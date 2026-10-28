import { Router, Request, Response } from 'express';
import { getDatabase } from '../db.js';

const router = Router();

// GET /api/appointments - List appointments with optional status filter
router.get('/', async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const appointments = await db.getAppointments(status);
    res.json({ success: true, count: appointments.length, data: appointments });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/appointments - Schedule a new appointment
router.post('/', async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const { patientId, providerName, department, appointmentDate, durationMinutes, status, reason, room } = req.body;

    if (!patientId || !providerName || !department || !appointmentDate || !reason) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed: patientId, providerName, department, appointmentDate, and reason are required.'
      });
    }

    const appointment = await db.createAppointment({
      patientId: Number(patientId),
      providerName,
      department,
      appointmentDate,
      durationMinutes: Number(durationMinutes) || 30,
      status: status || 'Scheduled',
      reason,
      room: room || 'Room 101'
    });

    res.status(201).json({ success: true, message: 'Appointment scheduled', data: appointment });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/appointments/:id/status - Update appointment status
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;

    const allowed = ['Scheduled', 'Arrived', 'In-Consultation', 'Completed', 'Cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, error: `Invalid status. Allowed: ${allowed.join(', ')}` });
    }

    const updated = await db.updateAppointmentStatus(id, status);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    res.json({ success: true, message: 'Status updated', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

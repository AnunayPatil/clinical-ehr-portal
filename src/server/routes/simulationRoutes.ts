import { Router, Request, Response } from 'express';
import { getDatabase } from '../db.js';

const router = Router();

// GET /api/stats - High-level metrics for dashboard
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const patients = await db.getPatients();
    const appointments = await db.getAppointments();
    const encounters = await db.getEncounters();
    const audits = await db.getAuditLogs(10);

    const activePatients = patients.filter(p => p.status === 'Active').length;
    const todayAppointments = appointments.filter(a => a.status !== 'Cancelled' && a.status !== 'Completed').length;
    const completedEncounters = encounters.length;

    res.json({
      success: true,
      data: {
        activePatients,
        totalPatients: patients.length,
        scheduledToday: todayAppointments,
        completedEncounters,
        databaseEngine: db.engineName,
        isPostgres: db.isPostgres,
        recentAudits: audits
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/audit-logs - Real-time audit trail
router.get('/audit-logs', async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const logs = await db.getAuditLogs(limit);
    res.json({ success: true, count: logs.length, data: logs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/simulate/stress - Execute 500+ concurrent requests stress test
router.post('/stress', async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const count = Math.min(Math.max(Number(req.body.count) || 500, 100), 2000);

    // Generator function creating randomized clinical vital telemetry payloads
    const payloadGen = (idx: number) => {
      // Intentionally generate occasional boundary test values
      const isExtreme = idx % 47 === 0;
      return {
        patientId: (idx % 6) + 1,
        systolic: isExtreme ? 290 : Math.floor(110 + Math.random() * 30),
        diastolic: isExtreme ? 170 : Math.floor(70 + Math.random() * 20),
        pulse: Math.floor(60 + Math.random() * 40),
        temp: +(97.5 + Math.random() * 2.0).toFixed(1),
        o2: Math.floor(95 + Math.random() * 5),
        batchIndex: idx,
        checksum: `CHK-${idx}-${Date.now().toString(36)}`
      };
    };

    const result = await db.simulateBatchStress(count, payloadGen);

    res.json({
      success: true,
      message: `Completed stress execution across ${count} concurrent simulated clinical requests`,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

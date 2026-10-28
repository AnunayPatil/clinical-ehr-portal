import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeDatabase, getDatabase } from './db.js';
import patientRoutes from './routes/patientRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import encounterRoutes from './routes/encounterRoutes.js';
import simulationRoutes from './routes/simulationRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path.startsWith('/api') && !req.path.includes('/stress')) {
      console.log(`[HTTP] ${req.method} ${req.path} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Serve frontend static files
const publicDir = path.resolve(__dirname, '../../public');
app.use(express.static(publicDir));

// API Health Check
app.get('/api/health', (req, res) => {
  const db = getDatabase();
  res.json({
    status: 'ONLINE',
    service: 'Clinical EHR & Healthcare Administrative Portal',
    timestamp: new Date().toISOString(),
    database: {
      engine: db.engineName,
      isPostgres: db.isPostgres
    },
    version: '1.0.0'
  });
});

// Mount modular REST API routes
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/encounters', encounterRoutes);
app.use('/api/simulate', simulationRoutes);

// Fallback to index.html for SPA client navigation
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Server Error Boundary Intercepted]:', err);
  res.status(500).json({
    success: false,
    error: 'Internal Clinical EHR Service Error',
    message: err.message
  });
});

async function bootstrap() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`==========================================================`);
      console.log(`🚀 Clinical EHR & Administrative Portal is running!`);
      console.log(`👉 Access URL: http://localhost:${PORT}`);
      console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`==========================================================`);
    });
  } catch (error) {
    console.error('Failed to start EHR server:', error);
    process.exit(1);
  }
}

bootstrap();

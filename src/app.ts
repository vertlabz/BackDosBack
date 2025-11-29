import express from 'express';
import 'dotenv/config';
import morgan from 'morgan';
import cors from 'cors';

import authRoutes from './routes/auth.routes';
import providersRoutes from './routes/providers.routes';
import appointmentsRoutes from './routes/appointments.routes';
import availabilityRoutes from './routes/availability.routes';

const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/providers', providersRoutes);
app.use('/appointments', appointmentsRoutes);
app.use('/availability', availabilityRoutes);

app.get('/', (req, res) => res.json({ ok: true }));

export default app;

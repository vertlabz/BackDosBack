import { Router } from 'express';
import prisma from '../prisma';
import ensureAuthenticated from '../middlewares/authMiddleware';

const router = Router();

router.post('/', ensureAuthenticated, async (req, res) => {
  // @ts-ignore
  const userId = req.user!.id as string;
  const { providerId, date, serviceId, notes } = req.body;
  if (!providerId || !date) return res.status(400).json({ message: 'providerId and date required' });

  const provider = await prisma.user.findUnique({ where: { id: providerId } });
  if (!provider || !provider.isProvider) return res.status(400).json({ message: 'Invalid provider' });

  const appointment = await prisma.appointment.create({
    data: {
      date: new Date(date),
      customerId: userId,
      providerId,
      serviceId,
      notes,
    },
  });

  return res.status(201).json(appointment);
});

router.get('/me', ensureAuthenticated, async (req, res) => {
  // @ts-ignore
  const userId = req.user!.id as string;
  const appointments = await prisma.appointment.findMany({
    where: { customerId: userId },
    include: { provider: { select: { id: true, name: true } }, service: true },
    orderBy: { date: 'asc' },
  });
  return res.json(appointments);
});

router.delete('/:id', ensureAuthenticated, async (req, res) => {
  const { id } = req.params;
  // @ts-ignore
  const userId = req.user!.id as string;
  const appointment = await prisma.appointment.findUnique({ where: { id } });
  if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

  if (appointment.customerId !== userId && appointment.providerId !== userId) return res.status(403).json({ message: 'Not allowed' });

  await prisma.appointment.update({ where: { id }, data: { status: 'CANCELLED' } });
  return res.json({ message: 'Cancelled' });
});

export default router;

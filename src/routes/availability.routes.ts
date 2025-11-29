import { Router } from 'express';
import prisma from '../prisma';
import ensureAuthenticated from '../middlewares/authMiddleware';

const router = Router();

router.post('/', ensureAuthenticated, async (req, res) => {
  // @ts-ignore
  const userId = req.user!.id as string;
  const { weekday, startTime, endTime } = req.body;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.isProvider) return res.status(403).json({ message: 'Only providers can set availability' });

  if (weekday < 0 || weekday > 6) return res.status(400).json({ message: 'weekday must be 0-6' });

  const created = await prisma.providerAvailability.create({
    data: { providerId: userId, weekday, startTime, endTime },
  });

  return res.status(201).json(created);
});

router.get('/:providerId', async (req, res) => {
  const { providerId } = req.params;
  const avail = await prisma.providerAvailability.findMany({
    where: { providerId },
    orderBy: { weekday: 'asc' },
  });
  return res.json(avail);
});

export default router;

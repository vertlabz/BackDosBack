import { Router } from 'express';
import prisma from '../prisma';
import ensureAuthenticated from '../middlewares/authMiddleware';

const router = Router();

router.get('/', ensureAuthenticated, async (req, res) => {
  const providers = await prisma.user.findMany({
    where: { isProvider: true },
    select: { id: true, name: true, email: true, avatarUrl: true },
  });
  return res.json(providers);
});

router.get('/:providerId', ensureAuthenticated, async (req, res) => {
  const { providerId } = req.params;
  const provider = await prisma.user.findUnique({
    where: { id: providerId },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      services: true,
      providerAvailabilities: true,
    },
  });
  if (!provider) return res.status(404).json({ message: 'Provider not found' });
  return res.json(provider);
});

export default router;

import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, isProvider } = req.body;
    if (!email || !password || !name) return res.status(400).json({ message: 'name, email and password required' });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ message: 'Email already used' });

    const hashed = await bcrypt.hash(password, 8);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, isProvider: !!isProvider },
      select: { id: true, name: true, email: true, isProvider: true, createdAt: true },
    });

    return res.status(201).json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'email and password required' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

    return res.json({ token, user: { id: user.id, name: user.name, email: user.email, isProvider: user.isProvider } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;

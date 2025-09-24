import express from 'express';
import { prisma } from '../utils/prisma';
import { authenticateToken, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *       403:
 *         description: Insufficient permissions
 */
router.get('/', authenticateToken, requireRole(['ADMIN']), asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json({
    users,
    total: users.length
  });
}));

/**
 * @swagger
 * /api/users/{id}/role:
 *   put:
 *     summary: Update user role (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [USER, ADMIN]
 *     responses:
 *       200:
 *         description: User role updated
 *       404:
 *         description: User not found
 *       403:
 *         description: Insufficient permissions
 */
router.put('/:id/role', authenticateToken, requireRole(['ADMIN']), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!id) {
    return res.status(400).json({
      error: 'User ID is required'
    });
  }

  if (!['USER', 'ADMIN'].includes(role)) {
    return res.status(400).json({
      error: 'Invalid role. Must be USER or ADMIN'
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: id }
  });

  if (!user) {
    return res.status(404).json({
      error: 'User not found'
    });
  }

  const updatedUser = await prisma.user.update({
    where: { id: id },
    data: { role },
    select: {
      id: true,
      email: true,
      role: true,
      updatedAt: true
    }
  });

  return res.json({
    message: 'User role updated successfully',
    user: updatedUser
  });
}));

export default router;
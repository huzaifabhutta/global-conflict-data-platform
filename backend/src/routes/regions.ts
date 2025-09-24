import express from 'express';
import { prisma } from '../utils/prisma';
import { authenticateToken } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

/**
 * @swagger
 * /api/regions:
 *   get:
 *     summary: Get all regions with conflict counts
 *     tags: [Regions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of regions
 */
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
  const regions = await prisma.conflict.groupBy({
    by: ['region'],
    _count: true,
    orderBy: { region: 'asc' }
  });

  const countries = await prisma.conflict.groupBy({
    by: ['country'],
    _count: true,
    orderBy: { country: 'asc' }
  });

  res.json({
    regions: regions.map((r: any) => ({
      name: r.region,
      conflictCount: r._count
    })),
    countries: countries.map((c: any) => ({
      name: c.country,
      conflictCount: c._count
    }))
  });
}));

/**
 * @swagger
 * /api/regions/{region}/conflicts:
 *   get:
 *     summary: Get conflicts for a specific region
 *     tags: [Regions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: region
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Conflicts in the region
 */
router.get('/:region/conflicts', authenticateToken, asyncHandler(async (req, res) => {
  const { region } = req.params;

  const conflicts = await prisma.conflict.findMany({
    where: {
      region: {
        contains: region,
        mode: 'insensitive'
      }
    },
    orderBy: { date: 'desc' }
  });

  const stats = await prisma.conflict.aggregate({
    where: {
      region: {
        contains: region,
        mode: 'insensitive'
      }
    },
    _count: true,
    _sum: { fatalities: true },
    _avg: { fatalities: true }
  });

  res.json({
    region,
    conflicts,
    stats: {
      totalConflicts: stats._count,
      totalFatalities: stats._sum.fatalities || 0,
      averageFatalities: Math.round(stats._avg.fatalities || 0)
    }
  });
}));

export default router;
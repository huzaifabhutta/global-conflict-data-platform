import express from 'express';
import Joi from 'joi';
import { prisma } from '../utils/prisma';
import { authenticateToken } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { validateRequest } from '../middleware/validation';

const router = express.Router();

const conflictQuerySchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(1000).default(10),
    country: Joi.string().optional(),
    region: Joi.string().optional(),
    eventType: Joi.string().optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    sortBy: Joi.string().valid('date', 'fatalities', 'country', 'eventType').default('date'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  }),
};

/**
 * @swagger
 * /api/conflicts:
 *   get:
 *     summary: Get conflicts with filtering and pagination
 *     tags: [Conflicts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of items per page
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         description: Filter by country
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *         description: Filter by region
 *       - in: query
 *         name: eventType
 *         schema:
 *           type: string
 *         description: Filter by event type
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date
 *     responses:
 *       200:
 *         description: List of conflicts
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticateToken, validateRequest(conflictQuerySchema), asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    country,
    region,
    eventType,
    startDate,
    endDate,
    sortBy = 'date',
    sortOrder = 'desc'
  } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {};

  if (country) {
    where.country = {
      contains: String(country),
      mode: 'insensitive',
    };
  }

  if (region) {
    where.region = {
      contains: String(region),
      mode: 'insensitive',
    };
  }

  if (eventType) {
    where.eventType = {
      contains: String(eventType),
      mode: 'insensitive',
    };
  }

  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(String(startDate));
    if (endDate) where.date.lte = new Date(String(endDate));
  }

  const orderBy = {
    [String(sortBy)]: String(sortOrder),
  };

  const [conflicts, total] = await Promise.all([
    prisma.conflict.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy,
    }),
    prisma.conflict.count({ where }),
  ]);

  const totalPages = Math.ceil(total / Number(limit));

  res.json({
    conflicts,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages,
      hasNext: Number(page) < totalPages,
      hasPrev: Number(page) > 1,
    },
  });
}));

/**
 * @swagger
 * /api/conflicts/stats:
 *   get:
 *     summary: Get conflict statistics
 *     tags: [Conflicts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conflict statistics
 */
router.get('/stats', authenticateToken, asyncHandler(async (req, res) => {
  const [
    totalConflicts,
    totalFatalities,
    conflictsByRegion,
    conflictsByEventType,
    recentConflicts
  ] = await Promise.all([
    prisma.conflict.count(),
    prisma.conflict.aggregate({
      _sum: { fatalities: true }
    }),
    prisma.conflict.groupBy({
      by: ['region'],
      _count: true
    }),
    prisma.conflict.groupBy({
      by: ['eventType'],
      _count: true
    }),
    prisma.conflict.count({
      where: {
        date: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      }
    })
  ]);

  res.json({
    totalConflicts,
    totalFatalities: totalFatalities._sum.fatalities || 0,
    recentConflicts,
    conflictsByRegion: conflictsByRegion.map((item: any) => ({
      region: item.region,
      count: item._count
    })),
    conflictsByEventType: conflictsByEventType.map((item: any) => ({
      eventType: item.eventType,
      count: item._count
    }))
  });
}));

/**
 * @swagger
 * /api/conflicts/export:
 *   get:
 *     summary: Export conflicts data
 *     tags: [Conflicts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv]
 *         description: Export format
 *     responses:
 *       200:
 *         description: Exported data
 */
router.get('/export', authenticateToken, asyncHandler(async (req, res) => {
  const { format = 'json' } = req.query;

  const conflicts = await prisma.conflict.findMany({
    orderBy: { date: 'desc' }
  });

  if (format === 'csv') {
    const csvHeaders = [
      'ID',
      'Title',
      'Country',
      'Region',
      'Event Type',
      'Date',
      'Fatalities',
      'Latitude',
      'Longitude',
      'Source'
    ].join(',');

    const csvRows = conflicts.map((conflict: { id: any; title: string; country: any; region: any; eventType: any; date: { toISOString: () => string; }; fatalities: any; latitude: any; longitude: any; source: any; }) => [
      conflict.id,
      `"${conflict.title.replace(/"/g, '""')}"`,
      conflict.country,
      conflict.region,
      conflict.eventType,
      conflict.date.toISOString().split('T')[0],
      conflict.fatalities || 0,
      conflict.latitude,
      conflict.longitude,
      conflict.source
    ].join(',')).join('\n');

    const csvContent = [csvHeaders, csvRows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=conflicts.csv');
    return res.send(csvContent);
  } else {
    return res.json({
      exportDate: new Date().toISOString(),
      totalRecords: conflicts.length,
      data: conflicts
    });
  }
}));

/**
 * @swagger
 * /api/conflicts/{id}:
 *   get:
 *     summary: Get conflict by ID
 *     tags: [Conflicts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Conflict details
 *       404:
 *         description: Conflict not found
 */
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const conflict = await prisma.conflict.findUnique({
    where: { id },
  });

  if (!conflict) {
    return res.status(404).json({
      error: 'Conflict not found',
    });
  }

  return res.json(conflict);
}));

export default router;
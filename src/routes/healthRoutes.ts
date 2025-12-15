import { Router } from 'express'
import { health, readiness } from '../controllers/healthController.ts'

const router = Router()

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the API service
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 service:
 *                   type: string
 *                   example: Express REST API
 */
router.get('/health', health)

/**
 * @swagger
 * /readiness:
 *   get:
 *     summary: Readiness check endpoint
 *     description: Checks if the service is ready to handle requests by verifying database and cache connectivity
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is ready
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ready
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 checks:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: boolean
 *                       example: true
 *                     cache:
 *                       type: boolean
 *                       example: true
 *       503:
 *         description: Service is not ready
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: not ready
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 checks:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: boolean
 *                     cache:
 *                       type: boolean
 *                 error:
 *                   type: string
 */
router.get('/readiness', readiness)

export default router

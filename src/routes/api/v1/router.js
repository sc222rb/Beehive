/**
 * @file API version 1 router.
 * @module routes/router
 * @author Sayaka Chishiki Jakobsson
 * @version 1.0.0
 */

import express from 'express'
import { router as accountRouter } from './accountRouter.js'
import { router as hiveRouter } from './hiveRouter.js'
import swaggerUi from 'swagger-ui-express'
import swaggerSpec from '../../../utils/swagger.js'

export const router = express.Router()

router.get('/', (req, res) => res.json({ message: 'Hooray! Welcome to version 1 of this very simple RESTful API!' }))
router.use('/auth', accountRouter)
router.use('/hives', hiveRouter)

// Set up Swagger UI
router.use('/docs', swaggerUi.serve)
router.get('/docs', swaggerUi.setup(swaggerSpec))

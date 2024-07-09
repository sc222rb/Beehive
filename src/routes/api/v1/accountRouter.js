/**
 * @file Defines the account router.
 * @module routes/accountRouter
 * @author Sayaka Chishiki Jakobsson
 * @version 1.0.0
 */

import express from 'express'
import { AccountController } from '../../../controllers/api/AccountController.js'

export const router = express.Router()

const controller = new AccountController()

// Map HTTP verbs and route paths to controller actions.
/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     summary: Log in a user
 *     description: Logs in a user with the provided username and password.
 *     tags:
 *     - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/login', (req, res, next) => controller.login(req, res, next))

/**
 * @openapi
 * /api/v1/auth/register:
 *   post:
 *     summary: Registers a user
 *     description: Creates a new user with the provided username and password.
 *     tags:
 *     - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *               password:
 *                 type: string
 *                 example: mypassword123
 *             required:
 *               - username
 *               - password
 *     responses:
 *       '201':
 *         description: User created successfully
 *       '400':
 *         description: Invalid input
 *       '409':
 *         description: Duplicated keys
 *       '500':
 *         description: Internal server error
 */
router.post('/register', (req, res, next) => controller.register(req, res, next))

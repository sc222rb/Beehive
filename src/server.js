/**
 * The starting point of the application.
 *
 * @author Sayaka Chishiki Jakobsson
 * @version 1.0.0
 */

import express from 'express'
import httpContext from 'express-http-context'
import logger from 'morgan'
import { connectToDatabase } from './config/mongoose.js'
import { router } from './routes/router.js'
import helmet from 'helmet'
import cors from 'cors'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import { downloadDataset } from './utils/kaggleDownloader.js'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Starts the HTTP server.
 *
 * @returns {Promise<void>}
 */
const startServer = async () => {
  try {
  // Connect to MongoDB.
    await connectToDatabase(process.env.DB_CONNECTION_STRING)

    // Create an Express application.
    const app = express()

    // Set various HTTP headers to make the application little more secure (https://www.npmjs.com/package/helmet).
    app.use(helmet())

    // Enable Cross Origin Resource Sharing (CORS) (https://www.npmjs.com/package/cors).
    app.use(cors())

    // Parse requests of the content type application/json.
    app.use(express.json())

    // Add the request-scoped context.
    // NOTE! Must be placed before any middle that needs access to the context!
    //       See https://www.npmjs.com/package/express-http-context.
    app.use(httpContext.middleware)

    // Set up a morgan logger using the dev format for log entries.
    app.use(logger('dev'))

    // Parse requests of the content type application/x-www-form-urlencoded.
    // Populates the request object with a body object (req.body).
    app.use(express.urlencoded({ extended: false }))

    // Setup and use session middleware (https://github.com/expressjs/session)
    if (process.env.NODE_ENV === 'production') {
      app.set('trust proxy', 1) // trust first proxy
    }

    // Register routes.
    app.use('/', router)

    // Error handler.
    app.use((err, req, res, next) => {
      err.status = err.status || 500

      if (process.env.NODE_ENV === 'production') {
        return res
          .status(err.status)
          .json({
            status: err.status,
            message: err.message
          })
      }

      // Development only!
      // Only providing detailed error in development.
      return res
        .status(err.status)
        .json({
          status: err.status,
          message: err.message,
          cause: err.cause
            ? {
                status: err.cause.status,
                message: err.cause.message,
                stack: err.cause.stack
              }
            : null,
          stack: err.stack
        })
    })

    // Starts the HTTP server listening for connections.
    app.listen(process.env.PORT, () => {
      console.log(`Server running at http://localhost:${process.env.PORT}`)
      console.log('Press Ctrl-C to terminate...')
    })
  } catch (err) {
    console.error(err)
    process.exitCode = 1
  }
}

/**
 * The main function of the application.
 *
 * @returns {Promise<void>}
 */
const main = async () => {
  try {
    if (process.env.NODE_ENV !== 'production') {
      const dataset = 'se18m502/bee-hive-metrics'
      const tokenPath = path.join(__dirname, '../.kaggle.json')
      const datasetDir = path.join(__dirname, '../data', dataset.replace('/', '_'))

      let datasetDownloaded = false

      if (fs.existsSync(datasetDir) && fs.readdirSync(datasetDir).length > 0) {
        console.log('Dataset already exists. Skipping download.')
        datasetDownloaded = true
      }

      if (!datasetDownloaded) {
        await downloadDataset(dataset, tokenPath)
      }
    }

    await startServer()
  } catch (error) {
    console.error('Failed to start server:', error)
  }
}

main()

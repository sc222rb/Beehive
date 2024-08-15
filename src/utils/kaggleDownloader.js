import fetch from 'node-fetch'
import fs from 'fs'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import unzip from 'unzipper'
import { parse } from 'csv-parse'
import { StatusModel } from '../models/StatusModel.js'
import { HiveModel } from '../models/HiveModel.js'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const hive = {
  name: 'Kalmar',
  location: 'KalrmarField1',
  author: 'author'
}

/**
 * Connects to the database.
 */
const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.DB_CONNECTION_STRING)
    console.log('Connected to MongoDB')
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error)
    process.exit(1)
  }
}

/**
 * Gets or creates a hive in MongoDB.
 *
 * @returns {Promise<import('../models/HiveModel').IHive>} The hive document.
 * @throws {Error}
 */
const getOrCreateHive = async () => {
  try {
    return await HiveModel.findOneAndUpdate(hive, hive, {
      upsert: true,
      new: true,
      runValidators: true
    })
  } catch (error) {
    console.error('Error creating/updating Hive:', error.message)
    throw error
  }
}

/**
 * Downloads a dataset from Kaggle.
 *
 * @param {string} dataset - The dataset to download.
 * @param {string} tokenPath - The path to the token file.
 */
export const downloadDataset = async (dataset, tokenPath) => {
  try {
    const token = JSON.parse(fs.readFileSync(tokenPath, 'utf8'))

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token.key}`
    }
    const url = `https://www.kaggle.com/api/v1/datasets/download/${dataset}`
    const response = await fetch(url, { headers })

    if (!response.ok) {
      throw new Error(`Failed to download dataset: ${response.statusText}`)
    }

    const destDir = path.join(__dirname, '..', '..', 'data', dataset.replace('/', '_'))
    const destPath = path.join(destDir, `${dataset.replace('/', '_')}.zip`)

    // Ensure the directory exists
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true })
    }

    const dest = fs.createWriteStream(destPath)
    response.body.pipe(dest)

    dest.on('finish', () => {
      console.log(`Dataset downloaded: ${destPath}`)
      extractAndSaveDataset(destPath, destDir)
    })
  } catch (error) {
    console.error('Error downloading dataset:', error)
  }
}

/**
 * Extracts and saves the dataset from a zip file.
 *
 * @param {string} zipFilePath - The path to the zip file.
 * @param {string} extractToPath - The path to extract the dataset to.
 */
const extractAndSaveDataset = async (zipFilePath, extractToPath) => {
  fs.createReadStream(zipFilePath)
    .pipe(unzip.Extract({ path: extractToPath }))
    .on('close', async () => {
      console.log(`Dataset extracted to: ${extractToPath}`)
      // Process each CSV file
      const files = [
        'flow_2017.csv',
        'humidity_2017.csv',
        'temperature_2017.csv',
        'weight_2017.csv'
      ]

      // Process each file independently
      for (const file of files) {
        try {
          await parseAndSaveCSV(path.join(extractToPath, file))
        } catch (error) {
          console.error(`Error processing ${file}:`, error)
        }
      }
    })
}

/**
 * Parses and saves a CSV file to MongoDB.
 *
 * @param {string} csvFilePath - The path to the CSV file.
 */
const parseAndSaveCSV = async (csvFilePath) => {
  let hiveDoc
  try {
    hiveDoc = await getOrCreateHive()
  } catch (error) {
    console.error('Error creating/updating Hive:', error.message)
    return
  }

  const records = []

  fs.createReadStream(csvFilePath)
    .pipe(parse({ columns: true })) // Parse CSV into objects with column names as keys
    .on('data', (data) => {
      const statusData = {
        hiveId: hiveDoc._id,
        humidity: data.humidity,
        weight: data.weight,
        temperature: data.temperature,
        hiveFlow: data.flow,
        timestamp: data.timestamp
      }
      records.push(statusData)
    })
    .on('end', () => {
      // Save records to MongoDB using Mongoose
      StatusModel.insertMany(records)
        .then((savedRecords) => {
          console.log(`Data from ${csvFilePath} saved to MongoDB`)
        })
        .catch((error) => console.error(`Error saving data from ${csvFilePath} to MongoDB:`, error))
    })
    .on('error', (err) => {
      console.error('Error parsing CSV:', err.message)
    })
}

/**
 * The main function that starts the server.
 */
const main = async () => {
  try {
    await connectToDatabase()
    const dataset = 'se18m502/bee-hive-metrics'
    const tokenPath = path.join(__dirname, '..', '..', '.kaggle.json')

    await downloadDataset(dataset, tokenPath)
  } catch (error) {
    console.error('Failed to start server:', error)
  }
}

main()

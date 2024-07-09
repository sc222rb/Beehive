import mongoose from 'mongoose'
import { BASE_SCHEMA } from './baseSchema.js'

// Create a schema.
const schema = new mongoose.Schema({
  hiveId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hive'
  },
  humidity: {
    type: Number
  },
  weight: {
    type: Number
  },
  temperature: {
    type: Number
  },
  hiveFlow: {
    type: Number
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
})

schema.add(BASE_SCHEMA)

// Create a model using the schema.
export const StatusModel = mongoose.model('Status', schema)

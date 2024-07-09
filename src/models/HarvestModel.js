/**
 * @file Defines the Harvest model.
 * @module models/HarvestModel
 * @author Sayaka Chishiki Jakobsson
 */

import mongoose from 'mongoose'
import { BASE_SCHEMA } from './baseSchema.js'

// Create a schema.
const schema = new mongoose.Schema({
  hiveId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hive',
    required: true
  },
  harvest: {
    type: Number,
    required: true
  }
})

schema.add(BASE_SCHEMA)

// Create a model using the schema.
export const HarvestModel = mongoose.model('Harvest', schema)

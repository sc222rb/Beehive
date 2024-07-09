/**
 * @file Defines the Hive model.
 * @module models/HiveModel
 * @author Sayaka Chishiki Jakobsson
 */

import mongoose from 'mongoose'
import { BASE_SCHEMA } from './baseSchema.js'

// Create a schema.
const schema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true
  },
  location: {
    type: String,
    trim: true,
    required: true
  }
})

schema.add(BASE_SCHEMA)

// Create a model using the schema.
export const HiveModel = mongoose.model('Hive', schema)

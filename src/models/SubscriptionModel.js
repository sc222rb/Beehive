/**
 * @file Defines the Subscription model.
 * @module models/SubscriptionModel
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
  postUrl: {
    type: String,
    required: true
  }
})

schema.add(BASE_SCHEMA)

// Create a model using the schema.
export const SubscriptionModel = mongoose.model('Subscription', schema)

const mongoose = require('mongoose');

const transformationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  status: {
    type: String,
    enum: ['pending', 'active', 'error'],
    default: 'pending'
  },
  type: {
    type: String,
    required: true,
    enum: ['rename'] // add other transformation types as needed
  },
  config: {
    type: Object,
    required: true
  },
  snapshotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Snapshot',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  activatedAt: Date
});

transformationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Transformation = mongoose.model('Transformation', transformationSchema);
module.exports = Transformation; 
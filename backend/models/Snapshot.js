const mongoose = require('mongoose');

const SnapshotSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['active', 'finalized'],
    default: 'active',
    required: true
  },
  datasetCount: {
    type: Number,
    default: 0
  },
  finalizedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  // Add timestamps
  timestamps: true,
  // Ensure virtuals are included in JSON
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add any indexes we need
SnapshotSchema.index({ status: 1, finalizedAt: -1 });

const Snapshot = mongoose.model('Snapshot', SnapshotSchema);

module.exports = Snapshot; 
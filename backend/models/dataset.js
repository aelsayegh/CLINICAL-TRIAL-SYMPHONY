const mongoose = require('mongoose');

const datasetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  headers: [String],
  data: [{
    type: Map,
    of: String
  }],
  headerCount: Number,
  dataCount: Number,
  snapshotId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Snapshot'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

datasetSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Dataset = mongoose.model('Dataset', datasetSchema);
module.exports = Dataset; 
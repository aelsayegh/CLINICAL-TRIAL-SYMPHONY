const mongoose = require('mongoose');

const TransformedDatasetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  sourceDatasetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dataset',
    required: true
  },
  headers: [{
    type: String
  }],
  data: [[mongoose.Schema.Types.Mixed]],
  transformations: [{
    type: {
      type: String,
      required: true
    },
    config: {
      type: mongoose.Schema.Types.Mixed
    }
  }],
  status: {
    type: String,
    enum: ['draft', 'active'],
    default: 'draft'
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

const TransformedDataset = mongoose.models.TransformedDataset || mongoose.model('TransformedDataset', TransformedDatasetSchema);
module.exports = TransformedDataset; 
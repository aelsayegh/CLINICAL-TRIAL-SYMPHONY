const express = require('express');
const router = express.Router();
const Dataset = require('../models/Dataset');
const Snapshot = require('../models/Snapshot');
const fs = require('fs');
const csv = require('csvtojson');
const { Transform } = require('stream');

// Get all datasets from latest activated snapshot
router.get('/', async (req, res) => {
  try {
    const { snapshotId } = req.query;
    
    console.log('Fetching datasets for snapshot:', snapshotId);

    // If snapshotId is provided, use it; otherwise find latest finalized
    let targetSnapshotId;
    if (snapshotId) {
      targetSnapshotId = snapshotId;
    } else {
      const latestSnapshot = await Snapshot.findOne({ 
        status: 'finalized' 
      }).sort({ createdAt: -1 });
      targetSnapshotId = latestSnapshot?._id;
    }

    console.log('Target snapshot ID:', targetSnapshotId);

    const datasets = await Dataset.find({ 
      snapshotId: targetSnapshotId 
    });

    console.log('Found datasets:', datasets.map(d => ({
      id: d._id,
      name: d.name,
      headerCount: d.headers?.length,
      dataCount: d.data?.length
    })));

    res.json({
      success: true,
      datasets: datasets,
      total: datasets.length,
      latestSnapshotId: targetSnapshotId
    });
  } catch (error) {
    console.error('Error fetching datasets:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching datasets',
      error: error.message
    });
  }
});

// Get dataset content
router.get('/:id/content', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, pageSize = 10 } = req.query;
    
    const dataset = await Dataset.findById(id);
    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: 'Dataset not found'
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    const rows = dataset.data?.slice(skip, skip + limit) || [];
    
    res.json({
      success: true,
      headers: dataset.headers || [],
      rows: rows,
      totalRows: dataset.data?.length || 0,
      currentPage: parseInt(page),
      totalPages: Math.ceil((dataset.data?.length || 0) / limit)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Add memory-efficient dataset preview endpoint
router.get('/:id/preview', async (req, res) => {
  try {
    const dataset = await Dataset.findById(req.params.id).lean();
    
    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: 'Dataset not found'
      });
    }

    // Read only first 100 rows for preview
    const rows = [];
    const fileStream = fs.createReadStream(dataset.path, { 
      encoding: 'utf-8',
      highWaterMark: 32 * 1024 // 32KB chunks
    });

    await new Promise((resolve, reject) => {
      csv()
        .fromStream(fileStream)
        .pipe(new Transform({
          objectMode: true,
          transform(chunk, encoding, callback) {
            if (rows.length < 100) {
              rows.push(chunk);
            } else {
              fileStream.destroy(); // Stop reading after 100 rows
            }
            callback();
          }
        }))
        .on('error', reject)
        .on('end', resolve);
    });

    res.json({
      success: true,
      preview: {
        headers: dataset.headers,
        rows: rows,
        totalRows: dataset.totalRows
      }
    });

  } catch (error) {
    console.error('Error generating dataset preview:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating dataset preview',
      error: error.message
    });
  }
});

// Create new dataset
router.post('/', async (req, res) => {
  try {
    const { name, headers, snapshotId } = req.body;

    console.log('Creating dataset:', {
      name,
      headerCount: headers?.length,
      snapshotId
    });

    // Validate input
    if (!headers || !Array.isArray(headers) || headers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid headers format'
      });
    }

    if (!snapshotId) {
      return res.status(400).json({
        success: false,
        message: 'Snapshot ID is required'
      });
    }

    const dataset = new Dataset({
      name,
      headers,
      snapshotId,
      data: []  // Initialize with empty array
    });

    const savedDataset = await dataset.save();

    console.log('Dataset created:', {
      id: savedDataset._id,
      name: savedDataset.name,
      headerCount: savedDataset.headers.length
    });

    res.json({
      success: true,
      datasetId: savedDataset._id
    });
  } catch (error) {
    console.error('Error creating dataset:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Add data to existing dataset
router.post('/:id/data', async (req, res) => {
  try {
    const { id } = req.params;
    const { data } = req.body;

    console.log('Uploading data for dataset:', id);
    console.log('Data sample:', {
      count: data?.length,
      firstRow: data?.[0],
      lastRow: data?.[data?.length - 1]
    });

    const dataset = await Dataset.findById(id);
    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: 'Dataset not found'
      });
    }

    // Validate data format
    if (!Array.isArray(data)) {
      return res.status(400).json({
        success: false,
        message: 'Data must be an array'
      });
    }

    // Update dataset with data
    dataset.data = data;
    dataset.dataCount = data.length;
    await dataset.save();

    console.log('Data uploaded successfully:', {
      datasetId: id,
      rowCount: data.length
    });

    res.json({
      success: true,
      message: 'Data uploaded successfully',
      rowCount: data.length
    });
  } catch (error) {
    console.error('Error uploading data:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Chunk upload endpoint
router.post('/chunk', async (req, res) => {
  try {
    const { name, headers, data, snapshotId, chunkIndex, totalChunks } = req.body;
    
    console.log('Received chunk upload request:', {
      name,
      headerCount: headers?.length,
      dataRowCount: data?.length,
      snapshotId,
      chunkIndex,
      totalChunks
    });

    // Validate input
    if (!headers || !Array.isArray(headers) || headers.length === 0) {
      throw new Error('Invalid headers format');
    }

    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error('Invalid data format');
    }

    if (!snapshotId) {
      throw new Error('Snapshot ID is required');
    }

    // Create new dataset
    const dataset = new Dataset({
      name,
      headers,
      data,
      snapshotId
    });

    console.log('Saving dataset:', {
      name: dataset.name,
      headerCount: dataset.headers.length,
      dataRowCount: dataset.data.length
    });

    await dataset.save();

    console.log('Dataset saved:', {
      id: dataset._id,
      headerCount: dataset.headers.length,
      dataRowCount: dataset.data.length
    });

    res.json({
      success: true,
      dataset: {
        _id: dataset._id,
        name: dataset.name,
        headerCount: dataset.headers.length,
        dataRowCount: dataset.data.length
      }
    });
  } catch (error) {
    console.error('Error processing chunk:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get datasets from latest finalized snapshot
router.get('/latest-finalized', async (req, res) => {
  try {
    console.log('\n=== Fetching Datasets from Latest Finalized Snapshot ===');

    // 1. Find latest finalized snapshot
    const latestSnapshot = await Snapshot.findOne(
      { status: 'finalized' },
      {},
      { sort: { finalizedAt: -1 } }
    );
    console.log('Latest finalized snapshot:', latestSnapshot);

    if (!latestSnapshot) {
      console.log('No finalized snapshots found');
      return res.json({
        success: true,
        datasets: [],
        total: 0,
        message: 'No finalized snapshots found'
      });
    }

    // 2. Get datasets for this snapshot
    const datasets = await Dataset.find({ 
      snapshotId: latestSnapshot._id 
    });
    console.log('Found datasets:', datasets.length);

    res.json({
      success: true,
      datasets,
      total: datasets.length,
      latestSnapshotId: latestSnapshot._id
    });
  } catch (error) {
    console.error('Error fetching latest datasets:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router; 
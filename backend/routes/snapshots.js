const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Snapshot = require('../models/Snapshot');
const Dataset = require('../models/Dataset');
const mongoose = require('mongoose');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// DEBUG route - Get all snapshots from database
router.get('/debug/all', async (req, res) => {
  try {
    console.log('DEBUG: Fetching all snapshots directly from DB');
    
    // Get all documents from the Snapshots collection
    const allSnapshots = await Snapshot.find({});
    
    console.log('DEBUG: Raw snapshots from DB:', allSnapshots);
    
    res.json({
      success: true,
      count: allSnapshots.length,
      snapshots: allSnapshots
    });
  } catch (error) {
    console.error('Debug route error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Regular get all snapshots route
router.get('/', async (req, res) => {
  try {
    console.log('\n=== Fetching All Snapshots ===');
    
    // Find all snapshots
    const snapshots = await Snapshot.find({})
      .sort({ createdAt: -1 });
    
    console.log('Found snapshots count:', snapshots.length);
    console.log('Snapshots:', snapshots);

    // Get dataset counts
    const snapshotsWithData = await Promise.all(
      snapshots.map(async (snapshot) => {
        const datasetCount = await Dataset.countDocuments({
          snapshotId: snapshot._id
        });
        
        return {
          ...snapshot.toObject(),
          datasetCount
        };
      })
    );

    console.log('Processed snapshots:', snapshotsWithData);
    console.log('=== Fetch Complete ===\n');

    res.json({
      success: true,
      snapshots: snapshotsWithData
    });
  } catch (error) {
    console.error('Error fetching snapshots:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get single snapshot
router.get('/:id', async (req, res) => {
  try {
    const snapshot = await Snapshot.findById(req.params.id);
    
    if (!snapshot) {
      return res.status(404).json({
        success: false,
        message: 'Snapshot not found'
      });
    }

    // Get associated datasets count
    const datasetCount = await Dataset.countDocuments({ snapshotId: snapshot._id });

    res.json({
      success: true,
      snapshot: {
        ...snapshot.toObject(),
        datasetCount
      }
    });
  } catch (error) {
    console.error('Error fetching snapshot:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching snapshot',
      error: error.message
    });
  }
});

// Get datasets for a specific snapshot
router.get('/:id/datasets', async (req, res) => {
  try {
    const datasets = await Dataset.find({ 
      snapshotId: req.params.id 
    }).sort({ createdAt: -1 });
    res.json(datasets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete dataset from a snapshot
router.delete('/:id/datasets/:datasetId', async (req, res) => {
  try {
    const dataset = await Dataset.findOneAndDelete({
      _id: req.params.datasetId,
      snapshotId: req.params.id
    });

    if (!dataset) {
      return res.status(404).json({ message: 'Dataset not found' });
    }

    // Update dataset count in snapshot
    const snapshot = await Snapshot.findById(req.params.id);
    if (snapshot) {
      snapshot.datasetCount = Math.max(0, (snapshot.datasetCount || 1) - 1);
      await snapshot.save();
    }

    // Delete the actual file
    if (dataset.path && fs.existsSync(dataset.path)) {
      fs.unlinkSync(dataset.path);
    }

    res.json({ message: 'Dataset deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new snapshot
router.post('/', async (req, res) => {
  try {
    console.log('Creating new snapshot');
    
    const snapshot = new Snapshot({
      status: 'active',
      datasetCount: 0
    });

    console.log('Saving snapshot:', snapshot);
    
    const savedSnapshot = await snapshot.save();
    
    console.log('Snapshot created:', savedSnapshot);

    res.json({
      success: true,
      snapshot: savedSnapshot
    });
  } catch (error) {
    console.error('Error creating snapshot:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating snapshot',
      error: error.message
    });
  }
});

// Upload datasets to a snapshot
router.post('/:id/datasets', upload.array('datasets'), async (req, res) => {
  try {
    const snapshot = await Snapshot.findById(req.params.id);
    if (!snapshot) {
      return res.status(404).json({ message: 'Snapshot not found' });
    }

    if (snapshot.status !== 'pending') {
      return res.status(400).json({ message: 'Can only add datasets to pending snapshots' });
    }

    const uploadedFiles = req.files;
    const datasets = [];

    for (const file of uploadedFiles) {
      const dataset = await Dataset.create({
        name: file.originalname,
        path: file.path,
        size: file.size,
        type: path.extname(file.originalname).substring(1),
        snapshotId: snapshot._id,
        status: 'active'
      });
      datasets.push(dataset);
    }

    snapshot.datasetCount = (snapshot.datasetCount || 0) + datasets.length;
    await snapshot.save();

    res.json(datasets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Finalize snapshot
router.post('/:id/finalize', async (req, res) => {
  try {
    const snapshotId = req.params.id;
    console.log('\n=== Starting Snapshot Finalization ===');
    console.log('Snapshot ID:', snapshotId);

    // 1. Verify snapshot exists
    const snapshot = await Snapshot.findById(snapshotId);
    if (!snapshot) {
      console.log('❌ Snapshot not found');
      return res.status(404).json({
        success: false,
        message: 'Snapshot not found'
      });
    }
    console.log('✓ Found snapshot:', snapshot);

    // 2. Count associated datasets
    const datasetCount = await Dataset.countDocuments({ 
      snapshotId: snapshot._id 
    });
    console.log('✓ Dataset count:', datasetCount);

    // 3. Update snapshot status
    const updateData = {
      status: 'finalized',
      datasetCount: datasetCount,
      finalizedAt: new Date()
    };
    console.log('Updating snapshot with:', updateData);

    const updatedSnapshot = await Snapshot.findByIdAndUpdate(
      snapshotId,
      updateData,
      { 
        new: true,
        runValidators: true
      }
    );

    // 4. Verify update
    const verifySnapshot = await Snapshot.findById(snapshotId);
    console.log('✓ Verification after update:', {
      id: verifySnapshot._id,
      status: verifySnapshot.status,
      datasetCount: verifySnapshot.datasetCount,
      finalizedAt: verifySnapshot.finalizedAt
    });

    if (verifySnapshot.status !== 'finalized') {
      throw new Error('Snapshot status was not updated properly');
    }

    console.log('=== Finalization Complete ===\n');
    
    res.json({
      success: true,
      message: 'Snapshot finalized successfully',
      snapshot: verifySnapshot
    });

  } catch (error) {
    console.error('❌ Error finalizing snapshot:', error);
    res.status(500).json({
      success: false,
      message: 'Error finalizing snapshot: ' + error.message
    });
  }
});

// Get latest finalized snapshot
router.get('/latest-finalized', async (req, res) => {
  try {
    console.log('\n=== Fetching Latest Finalized Snapshot ===');
    
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
        snapshot: null
      });
    }

    res.json({
      success: true,
      snapshot: latestSnapshot
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router; 
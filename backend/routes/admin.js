const express = require('express');
const router = express.Router();
const Snapshot = require('../models/Snapshot');
const Dataset = require('../models/Dataset');

// Add this route to clean up all data
router.post('/cleanup', async (req, res) => {
  try {
    console.log('Starting database cleanup...');
    
    // Delete all datasets
    const datasetsResult = await Dataset.deleteMany({});
    console.log(`Deleted ${datasetsResult.deletedCount} datasets`);
    
    // Delete all snapshots
    const snapshotsResult = await Snapshot.deleteMany({});
    console.log(`Deleted ${snapshotsResult.deletedCount} snapshots`);
    
    res.json({
      success: true,
      message: 'Database cleaned successfully',
      deletedCounts: {
        datasets: datasetsResult.deletedCount,
        snapshots: snapshotsResult.deletedCount
      }
    });
  } catch (error) {
    console.error('Error during cleanup:', error);
    res.status(500).json({
      success: false,
      message: 'Error cleaning database',
      error: error.message
    });
  }
});

module.exports = router; 
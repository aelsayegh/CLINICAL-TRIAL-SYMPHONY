const express = require('express');
const router = express.Router();
const Transformation = require('../models/Transformation');
const Dataset = require('../models/Dataset');

// Get all transformations
router.get('/', async (req, res) => {
  try {
    const transformations = await Transformation.find();
    res.json({ success: true, transformations });
  } catch (error) {
    console.error('Error fetching transformations:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get transformation by ID
router.get('/:id', async (req, res) => {
  try {
    const transformation = await Transformation.findById(req.params.id);
    if (!transformation) {
      return res.status(404).json({ success: false, message: 'Transformation not found' });
    }
    res.json({ success: true, dataset: transformation });
  } catch (error) {
    console.error('Error fetching transformation:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new transformation
router.post('/', async (req, res) => {
  try {
    const transformation = new Transformation(req.body);
    await transformation.save();
    res.json({ success: true, transformation });
  } catch (error) {
    console.error('Error creating transformation:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update transformation
router.put('/:id', async (req, res) => {
  try {
    const transformation = await Transformation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!transformation) {
      return res.status(404).json({ success: false, message: 'Transformation not found' });
    }
    res.json({ success: true, transformation });
  } catch (error) {
    console.error('Error updating transformation:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Activate transformation
router.post('/:id/activate', async (req, res) => {
  try {
    const { id } = req.params;
    const { snapshotId } = req.body;

    if (!snapshotId) {
      return res.status(400).json({ 
        success: false, 
        message: 'snapshotId is required' 
      });
    }

    const transformation = await Transformation.findByIdAndUpdate(
      id,
      {
        status: 'active',
        activatedAt: new Date(),
        snapshotId
      },
      { new: true, runValidators: true }
    );

    if (!transformation) {
      return res.status(404).json({ 
        success: false, 
        message: 'Transformation not found' 
      });
    }

    res.json({ success: true, transformation });
  } catch (error) {
    console.error('Error activating transformation:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Preview transformation
router.post('/preview', async (req, res) => {
  try {
    console.log('=== Preview Request ===');
    const { datasetId, transformations } = req.body;
    
    console.log('Request payload:', {
      datasetId,
      transformations
    });

    if (!datasetId || !transformations) {
      console.log('Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'datasetId and transformations are required'
      });
    }

    const dataset = await Dataset.findById(datasetId);
    console.log('Found dataset:', dataset ? {
      id: dataset._id,
      name: dataset.name,
      headerCount: dataset.headers?.length
    } : 'Not found');

    // Get preview data (first 10 rows)
    const previewData = {
      headers: dataset.headers || [],
      data: (dataset.data || []).slice(0, 10),
      columnTypes: dataset.columnTypes || {}
    };

    console.log('Sending preview:', {
      headerCount: previewData.headers.length,
      rowCount: previewData.data.length
    });

    res.json({
      success: true,
      preview: previewData
    });
  } catch (error) {
    console.error('Preview error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router; 
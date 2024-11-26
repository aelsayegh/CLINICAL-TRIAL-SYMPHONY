const { ValidationErrors, ColumnTypes, detectColumnType, validateFilterOperator } = require('../utils/transformationValidation');
const Dataset = require('../models/dataset');

const validateTransformationMiddleware = async (req, res, next) => {
  try {
    const { datasetId, transformations } = req.body;
    
    // Validate basic request structure
    if (!datasetId || !transformations || !Array.isArray(transformations)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request format',
        errors: { general: 'Missing required fields or invalid format' }
      });
    }

    // Get dataset for validation
    const dataset = await Dataset.findById(datasetId);
    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: 'Dataset not found'
      });
    }

    const errors = [];
    const processedHeaders = [...dataset.headers];

    // Validate each transformation in sequence
    for (let i = 0; i < transformations.length; i++) {
      const transformation = transformations[i];
      const transformationErrors = validateTransformation(
        transformation,
        processedHeaders,
        dataset.data[0] || []
      );

      if (Object.keys(transformationErrors).length > 0) {
        errors.push({
          step: i + 1,
          type: transformation.type,
          errors: transformationErrors
        });
      }

      // Update headers for subsequent validations
      if (transformation.type === 'rename' && !transformationErrors.newName) {
        const index = processedHeaders.indexOf(transformation.config.sourceColumn);
        if (index !== -1) {
          processedHeaders[index] = transformation.config.newName;
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Add validated dataset and processed headers to request
    req.validatedDataset = dataset;
    req.processedHeaders = processedHeaders;
    next();

  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during validation',
      error: error.message
    });
  }
};

const validateTransformation = (transformation, headers, sampleRow) => {
  const errors = {};

  switch (transformation.type) {
    case 'rename':
      if (!transformation.config.sourceColumn) {
        errors.sourceColumn = ValidationErrors.REQUIRED_FIELD;
      } else if (!headers.includes(transformation.config.sourceColumn)) {
        errors.sourceColumn = ValidationErrors.COLUMN_NOT_FOUND;
      }

      if (!transformation.config.newName) {
        errors.newName = ValidationErrors.REQUIRED_FIELD;
      } else if (headers.includes(transformation.config.newName)) {
        errors.newName = ValidationErrors.DUPLICATE_NAME;
      }
      break;

    case 'filter':
      if (!transformation.config.column) {
        errors.column = ValidationErrors.REQUIRED_FIELD;
      } else {
        const columnIndex = headers.indexOf(transformation.config.column);
        if (columnIndex === -1) {
          errors.column = ValidationErrors.COLUMN_NOT_FOUND;
        } else {
          const columnType = detectColumnType(sampleRow[columnIndex]);
          errors.operator = validateFilterOperator(
            transformation.config.operator,
            columnType
          );
        }
      }
      break;

    // Add other transformation validations...
  }

  return errors;
};

module.exports = validateTransformationMiddleware; 
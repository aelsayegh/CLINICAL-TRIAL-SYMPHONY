export const ValidationErrors = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_NUMBER: 'Must be a valid number',
  DUPLICATE_NAME: 'Column name already exists',
  INVALID_DATE: 'Must be a valid date',
  COLUMN_NOT_FOUND: 'Column not found in dataset',
  INVALID_OPERATOR: 'Invalid operator for selected column type',
  NO_AGGREGATION: 'At least one aggregation is required',
  NO_GROUP_BY: 'At least one group by column is required',
  INVALID_SORT_COLUMN: 'Invalid sort column',
};

export const ColumnTypes = {
  NUMBER: 'number',
  STRING: 'string',
  DATE: 'date',
  BOOLEAN: 'boolean',
};

// Detect column type from sample data
export const detectColumnType = (sampleData) => {
  if (!sampleData || sampleData === '') return ColumnTypes.STRING;
  
  if (!isNaN(sampleData) && !isNaN(parseFloat(sampleData))) {
    return ColumnTypes.NUMBER;
  }
  
  const dateValue = new Date(sampleData);
  if (dateValue instanceof Date && !isNaN(dateValue)) {
    return ColumnTypes.DATE;
  }
  
  if (typeof sampleData === 'boolean' || sampleData === 'true' || sampleData === 'false') {
    return ColumnTypes.BOOLEAN;
  }
  
  return ColumnTypes.STRING;
};

// Validation rules for each transformation type
export const validateTransformation = (transformation, dataset, existingTransformations = []) => {
  const errors = {};
  
  switch (transformation.type) {
    case 'rename':
      errors.rename = validateRenameTransformation(transformation.config, dataset, existingTransformations);
      break;
    case 'filter':
      errors.filter = validateFilterTransformation(transformation.config, dataset);
      break;
    case 'aggregate':
      errors.aggregate = validateAggregateTransformation(transformation.config, dataset);
      break;
    case 'sort':
      errors.sort = validateSortTransformation(transformation.config, dataset);
      break;
    default:
      errors.type = 'Invalid transformation type';
  }
  
  return errors;
};

const validateRenameTransformation = (config, dataset, existingTransformations) => {
  const errors = {};
  
  if (!config.sourceColumn) {
    errors.sourceColumn = ValidationErrors.REQUIRED_FIELD;
  } else if (!dataset.headers.includes(config.sourceColumn)) {
    errors.sourceColumn = ValidationErrors.COLUMN_NOT_FOUND;
  }
  
  if (!config.newName) {
    errors.newName = ValidationErrors.REQUIRED_FIELD;
  } else {
    // Check for duplicate names in original headers and previous transformations
    const existingNames = new Set([
      ...dataset.headers,
      ...existingTransformations
        .filter(t => t.type === 'rename')
        .map(t => t.config.newName)
    ]);
    
    if (existingNames.has(config.newName)) {
      errors.newName = ValidationErrors.DUPLICATE_NAME;
    }
  }
  
  return errors;
};

const validateFilterTransformation = (config, dataset) => {
  const errors = {};
  
  if (!config.column) {
    errors.column = ValidationErrors.REQUIRED_FIELD;
  } else if (!dataset.headers.includes(config.column)) {
    errors.column = ValidationErrors.COLUMN_NOT_FOUND;
  }
  
  if (!config.operator) {
    errors.operator = ValidationErrors.REQUIRED_FIELD;
  } else {
    // Get column type from sample data
    const columnIndex = dataset.headers.indexOf(config.column);
    const sampleData = dataset.data[0]?.[columnIndex];
    const columnType = detectColumnType(sampleData);
    
    // Validate operator based on column type
    const validOperators = {
      [ColumnTypes.NUMBER]: ['equals', 'greaterThan', 'lessThan', 'between'],
      [ColumnTypes.STRING]: ['equals', 'contains', 'startsWith', 'endsWith'],
      [ColumnTypes.DATE]: ['equals', 'before', 'after', 'between'],
      [ColumnTypes.BOOLEAN]: ['equals']
    };
    
    if (!validOperators[columnType].includes(config.operator)) {
      errors.operator = ValidationErrors.INVALID_OPERATOR;
    }
  }
  
  if (!config.value && config.operator !== 'isNull' && config.operator !== 'isNotNull') {
    errors.value = ValidationErrors.REQUIRED_FIELD;
  }
  
  return errors;
};

const validateAggregateTransformation = (config, dataset) => {
  const errors = {};
  
  if (!config.groupBy || config.groupBy.length === 0) {
    errors.groupBy = ValidationErrors.NO_GROUP_BY;
  } else {
    const invalidColumns = config.groupBy.filter(col => !dataset.headers.includes(col));
    if (invalidColumns.length > 0) {
      errors.groupBy = `Invalid columns: ${invalidColumns.join(', ')}`;
    }
  }
  
  if (!config.aggregations || config.aggregations.length === 0) {
    errors.aggregations = ValidationErrors.NO_AGGREGATION;
  } else {
    const aggregationErrors = config.aggregations.map((agg, index) => {
      const aggErrors = {};
      
      if (!agg.column) {
        aggErrors.column = ValidationErrors.REQUIRED_FIELD;
      } else if (!dataset.headers.includes(agg.column)) {
        aggErrors.column = ValidationErrors.COLUMN_NOT_FOUND;
      }
      
      if (!agg.function) {
        aggErrors.function = ValidationErrors.REQUIRED_FIELD;
      } else {
        // Validate function based on column type
        const columnIndex = dataset.headers.indexOf(agg.column);
        const sampleData = dataset.data[0]?.[columnIndex];
        const columnType = detectColumnType(sampleData);
        
        const validFunctions = {
          [ColumnTypes.NUMBER]: ['sum', 'avg', 'min', 'max', 'count'],
          [ColumnTypes.STRING]: ['count', 'countDistinct'],
          [ColumnTypes.DATE]: ['min', 'max', 'count'],
          [ColumnTypes.BOOLEAN]: ['count', 'countTrue', 'countFalse']
        };
        
        if (!validFunctions[columnType].includes(agg.function)) {
          aggErrors.function = 'Invalid aggregation function for column type';
        }
      }
      
      return aggErrors;
    });
    
    if (aggregationErrors.some(err => Object.keys(err).length > 0)) {
      errors.aggregations = aggregationErrors;
    }
  }
  
  return errors;
};

const validateSortTransformation = (config, dataset) => {
  const errors = {};
  
  if (!config.sortRules || config.sortRules.length === 0) {
    errors.sortRules = 'At least one sort rule is required';
  } else {
    const sortErrors = config.sortRules.map((rule, index) => {
      const ruleErrors = {};
      
      if (!rule.column) {
        ruleErrors.column = ValidationErrors.REQUIRED_FIELD;
      } else if (!dataset.headers.includes(rule.column)) {
        ruleErrors.column = ValidationErrors.COLUMN_NOT_FOUND;
      }
      
      if (!rule.direction || !['asc', 'desc'].includes(rule.direction)) {
        ruleErrors.direction = 'Invalid sort direction';
      }
      
      return ruleErrors;
    });
    
    if (sortErrors.some(err => Object.keys(err).length > 0)) {
      errors.sortRules = sortErrors;
    }
  }
  
  return errors;
}; 
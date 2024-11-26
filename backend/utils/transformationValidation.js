const ValidationErrors = {
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

const ColumnTypes = {
  NUMBER: 'number',
  STRING: 'string',
  DATE: 'date',
  BOOLEAN: 'boolean',
};

const detectColumnType = (sampleData) => {
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

const validateFilterOperator = (operator, columnType) => {
  const validOperators = {
    [ColumnTypes.NUMBER]: ['equals', 'greaterThan', 'lessThan', 'between'],
    [ColumnTypes.STRING]: ['equals', 'contains', 'startsWith', 'endsWith'],
    [ColumnTypes.DATE]: ['equals', 'before', 'after', 'between'],
    [ColumnTypes.BOOLEAN]: ['equals']
  };

  if (!validOperators[columnType]?.includes(operator)) {
    return ValidationErrors.INVALID_OPERATOR;
  }

  return null;
};

module.exports = {
  ValidationErrors,
  ColumnTypes,
  detectColumnType,
  validateFilterOperator
}; 
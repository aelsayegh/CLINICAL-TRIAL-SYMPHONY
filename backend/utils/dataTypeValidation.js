const { ColumnTypes } = require('./transformationValidation');

const validateDataTypes = (data, headers) => {
  if (!data || !data.length || !headers || !headers.length) {
    return {
      columnTypes: {},
      errors: [],
      isValid: true
    };
  }

  // First pass: Analyze all rows to determine most appropriate type
  const columnTypes = analyzeColumnTypes(data, headers);
  
  // Display column types in console for debugging
  console.log('Column Types Detected:');
  headers.forEach(header => {
    console.log(`${header}: ${columnTypes[header]}`);
  });

  return {
    columnTypes,
    errors: [], // No errors since we adapt to the data
    isValid: true,
    rowsChecked: data.length,
    totalErrors: 0
  };
};

const analyzeColumnTypes = (data, headers) => {
  const types = {};
  const typeFrequency = {};

  // Initialize type frequency counters
  headers.forEach(header => {
    typeFrequency[header] = {
      number: 0,
      date: 0,
      boolean: 0,
      string: 0
    };
  });

  // Analyze each row
  data.forEach(row => {
    headers.forEach((header, index) => {
      const value = row[index];
      const detectedType = detectType(value);
      typeFrequency[header][detectedType]++;
    });
  });

  // Determine most common type for each column
  headers.forEach(header => {
    const freq = typeFrequency[header];
    // If more than 70% of values are of a specific type, use that type
    // Otherwise default to string
    if (freq.number / data.length > 0.7) {
      types[header] = ColumnTypes.NUMBER;
    } else if (freq.date / data.length > 0.7) {
      types[header] = ColumnTypes.DATE;
    } else if (freq.boolean / data.length > 0.7) {
      types[header] = ColumnTypes.BOOLEAN;
    } else {
      types[header] = ColumnTypes.STRING;
    }
  });

  return types;
};

const detectType = (value) => {
  if (value === null || value === undefined || value === '') {
    return 'string';
  }

  // Try number
  if (!isNaN(value) && !isNaN(parseFloat(value))) {
    return 'number';
  }

  // Try date
  const dateValue = new Date(value);
  if (dateValue instanceof Date && !isNaN(dateValue)) {
    return 'date';
  }

  // Try boolean
  const booleanValues = ['true', 'false', '1', '0', 'yes', 'no'];
  if (typeof value === 'boolean' || booleanValues.includes(String(value).toLowerCase())) {
    return 'boolean';
  }

  // Default to string
  return 'string';
};

module.exports = {
  validateDataTypes,
  analyzeColumnTypes,
  detectType
}; 
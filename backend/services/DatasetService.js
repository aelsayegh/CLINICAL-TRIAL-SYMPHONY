const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

class DatasetService {
  constructor() {
    this.dbPath = path.join(__dirname, '../temp/datasets.db');
    this.ensureTempDir();
  }

  ensureTempDir() {
    const tempDir = path.dirname(this.dbPath);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
  }

  async initializeDb() {
    return await open({
      filename: this.dbPath,
      driver: sqlite3.Database
    });
  }

  async importDataset(datasetId, filePath) {
    console.log(`Importing dataset ${datasetId} from ${filePath}`);
    const db = await this.initializeDb();

    try {
      // Create table for this dataset
      const tableName = `dataset_${datasetId}`;
      let headers = null;
      let columnTypes = {};

      // First pass: determine column types
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('headers', (headerRow) => {
            headers = headerRow;
            headers.forEach(header => {
              columnTypes[header] = 'TEXT'; // Default to TEXT
            });
          })
          .on('data', (row) => {
            // Check first row for numeric values
            Object.entries(row).forEach(([key, value]) => {
              if (!isNaN(value) && value !== '') {
                columnTypes[key] = 'NUMERIC';
              }
            });
          })
          .on('end', resolve)
          .on('error', reject);
      });

      // Create table with appropriate column types
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS ${tableName} (
          _id INTEGER PRIMARY KEY AUTOINCREMENT,
          ${headers.map(header => `${header.replace(/[^a-zA-Z0-9_]/g, '_')} ${columnTypes[header]}`).join(',')}
        )
      `;
      await db.run(createTableSQL);

      // Second pass: import data
      let rowCount = 0;
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', async (row) => {
            const columns = headers.map(h => h.replace(/[^a-zA-Z0-9_]/g, '_')).join(',');
            const placeholders = headers.map(() => '?').join(',');
            const values = headers.map(h => row[h]);
            
            await db.run(
              `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`,
              values
            );
            rowCount++;
          })
          .on('end', resolve)
          .on('error', reject);
      });

      return {
        headers,
        rowCount,
        columnTypes
      };

    } finally {
      await db.close();
    }
  }

  async getDatasetPage(datasetId, page, pageSize, sortField, sortOrder) {
    const db = await this.initializeDb();
    const tableName = `dataset_${datasetId}`;
    const offset = page * pageSize;

    try {
      // Build the SQL query with sorting
      const orderClause = sortField ? 
        `ORDER BY ${sortField.replace(/[^a-zA-Z0-9_]/g, '_')} ${sortOrder}` : 
        'ORDER BY _id';

      const query = `
        SELECT *
        FROM ${tableName}
        ${orderClause}
        LIMIT ? OFFSET ?
      `;

      const rows = await db.all(query, [pageSize, offset]);
      const countResult = await db.get(`SELECT COUNT(*) as count FROM ${tableName}`);

      return {
        data: rows.map((row, index) => ({
          id: offset + index,
          ...row
        })),
        totalRows: countResult.count
      };

    } finally {
      await db.close();
    }
  }
}

module.exports = new DatasetService();
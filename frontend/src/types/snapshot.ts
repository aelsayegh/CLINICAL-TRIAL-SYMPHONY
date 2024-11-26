// Define core types for the snapshot system
interface SnapshotMetadata {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'archived' | 'processing';
  version: string;
  tags: string[];
}

interface DataFile {
  id: string;
  filename: string;
  fileType: 'csv' | 'xlsx' | 'sas7bdat';
  size: number;
  rowCount: number;
  columnCount: number;
  headers: string[];
  dataTypes: Record<string, string>;
  uploadedAt: Date;
  checksum: string;
}

interface SnapshotStatistics {
  totalRecords: number;
  totalFiles: number;
  domainCounts: Record<string, number>;
  missingValueStats: Record<string, number>;
  dataQualityScore: number;
}

interface Snapshot {
  metadata: SnapshotMetadata;
  files: DataFile[];
  statistics: SnapshotStatistics;
  relationships: {
    sourceId: string;
    targetId: string;
    relationshipType: 'parent' | 'child' | 'related';
  }[];
} 
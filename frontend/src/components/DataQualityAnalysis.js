import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TimelineIcon from '@mui/icons-material/Timeline';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import axios from 'axios';

// Add API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

// Add DataQualityPanel component
const DataQualityPanel = ({ data, columns }) => {
  const [qualityStats, setQualityStats] = useState(null);

  useEffect(() => {
    if (data.length > 0) {
      const stats = {};
      columns.forEach(col => {
        const values = data.map(row => row[col.field]);
        const outliers = detectOutliers(values);
        const dataType = inferDataType(values);
        
        stats[col.field] = {
          totalCount: values.length,
          nullCount: values.filter(v => v === null || v === '').length,
          uniqueCount: new Set(values).size,
          outlierCount: outliers.filter(Boolean).length,
          dataType: dataType,
          completeness: ((values.length - values.filter(v => v === null || v === '').length) / values.length * 100).toFixed(1)
        };
      });
      setQualityStats(stats);
    }
  }, [data, columns]);

  return (
    <Grid container spacing={2}>
      {qualityStats && Object.entries(qualityStats).map(([column, stats]) => (
        <Grid item xs={12} sm={6} md={4} key={column}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>{column}</Typography>
              <Typography variant="body2">Type: {stats.dataType}</Typography>
              <Typography variant="body2">Completeness: {stats.completeness}%</Typography>
              <Typography variant="body2">Unique Values: {stats.uniqueCount}</Typography>
              {stats.outlierCount > 0 && (
                <Typography variant="body2" color="error">
                  Outliers: {stats.outlierCount}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

// Add StatisticsPanel component
const StatisticsPanel = ({ data, columns }) => {
  const [statistics, setStatistics] = useState({});

  useEffect(() => {
    if (data.length > 0) {
      const stats = {};
      columns.forEach(col => {
        const values = data.map(row => row[col.field]);
        const numericValues = values.filter(v => !isNaN(v));
        
        if (numericValues.length > 0) {
          stats[col.field] = {
            min: Math.min(...numericValues),
            max: Math.max(...numericValues),
            avg: numericValues.reduce((a, b) => a + Number(b), 0) / numericValues.length,
            count: values.length
          };
        } else {
          stats[col.field] = {
            uniqueValues: new Set(values).size,
            count: values.length
          };
        }
      });
      setStatistics(stats);
    }
  }, [data, columns]);

  return (
    <Grid container spacing={2}>
      {Object.entries(statistics).map(([column, stats]) => (
        <Grid item xs={12} sm={6} md={4} key={column}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2">{column}</Typography>
              {stats.avg !== undefined ? (
                <>
                  <Typography variant="body2">Min: {stats.min.toFixed(2)}</Typography>
                  <Typography variant="body2">Max: {stats.max.toFixed(2)}</Typography>
                  <Typography variant="body2">Average: {stats.avg.toFixed(2)}</Typography>
                </>
              ) : (
                <Typography variant="body2">Unique Values: {stats.uniqueValues}</Typography>
              )}
              <Typography variant="body2">Count: {stats.count}</Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

// Add CorrelationMatrix component
const CorrelationMatrix = ({ data, columns }) => {
  const [correlations, setCorrelations] = useState(null);

  useEffect(() => {
    if (data.length > 0) {
      const numericColumns = columns.filter(col => 
        data.every(row => !isNaN(row[col.field]))
      );
      
      const correlationData = {};
      numericColumns.forEach(col1 => {
        correlationData[col1.field] = {};
        numericColumns.forEach(col2 => {
          if (col1.field !== col2.field) {
            const values1 = data.map(row => Number(row[col1.field]));
            const values2 = data.map(row => Number(row[col2.field]));
            correlationData[col1.field][col2.field] = calculateCorrelation(values1, values2);
          }
        });
      });
      setCorrelations(correlationData);
    }
  }, [data, columns]);

  const calculateCorrelation = (x, y) => {
    const mean1 = x.reduce((a, b) => a + b, 0) / x.length;
    const mean2 = y.reduce((a, b) => a + b, 0) / y.length;
    
    const numerator = x.reduce((sum, xi, i) => sum + (xi - mean1) * (y[i] - mean2), 0);
    const denominator = Math.sqrt(
      x.reduce((sum, xi) => sum + Math.pow(xi - mean1, 2), 0) *
      y.reduce((sum, yi) => sum + Math.pow(yi - mean2, 2), 0)
    );
    
    return denominator === 0 ? 0 : numerator / denominator;
  };

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Variables</TableCell>
            {correlations && Object.keys(correlations).map(col => (
              <TableCell key={col}>{col}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {correlations && Object.entries(correlations).map(([row, cols]) => (
            <TableRow key={row}>
              <TableCell component="th" scope="row">{row}</TableCell>
              {Object.keys(correlations).map(col => (
                <TableCell key={col}>
                  {row === col ? '1.000' : 
                    (cols[col] || 0).toFixed(3)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// Add utility functions
const detectOutliers = (values) => {
  const numericValues = values.map(v => Number(v)).filter(v => !isNaN(v));
  if (numericValues.length === 0) return [];
  
  const mean = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
  const std = Math.sqrt(
    numericValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / numericValues.length
  );
  
  return values.map(v => {
    const value = Number(v);
    if (isNaN(value)) return false;
    return Math.abs(value - mean) > 3 * std;
  });
};

const inferDataType = (values) => {
  const sample = values.find(v => v !== null && v !== '');
  if (!sample) return 'empty';
  
  if (!isNaN(sample) && !isNaN(parseFloat(sample))) return 'numeric';
  if (sample.toLowerCase() === 'true' || sample.toLowerCase() === 'false') return 'boolean';
  if (!isNaN(Date.parse(sample))) return 'date';
  return 'string';
};

// Update the main component to use these components
const DataQualityAnalysis = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [error, setError] = useState(null);
  const [snapshot, setSnapshot] = useState(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/snapshots/${id}`);
      
      // Assuming your API returns { data: [...], name: "snapshot name" }
      if (response.data) {
        setSnapshot(response.data);
        
        // Handle the data array
        const dataArray = response.data.data || [];
        setData(dataArray);
        
        // Generate columns if we have data
        if (dataArray.length > 0) {
          const generatedColumns = Object.keys(dataArray[0]).map(key => ({
            field: key,
            headerName: key,
            flex: 1,
          }));
          setColumns(generatedColumns);
        }
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const AnalysisAccordions = () => (
    <Box sx={{ mb: 3 }}>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssessmentIcon />
            <Typography>Data Quality Analysis</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <DataQualityPanel data={data} columns={columns} />
          <StatisticsPanel data={data} columns={columns} />
          <CorrelationMatrix data={data} columns={columns} />
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TimelineIcon />
            <Typography>Statistical Summary</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <StatisticsPanel />
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BubbleChartIcon />
            <Typography>Correlation Analysis</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <CorrelationMatrix />
        </AccordionDetails>
      </Accordion>
    </Box>
  );

  const ChartControls = () => (
    <Box sx={{ mb: 2 }}>
      {/* Copy the ChartControls implementation from SnapshotDetail.js */}
    </Box>
  );

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Error: {error}</Typography>
      </Box>
    );
  }

  // Show empty state
  if (!data || data.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>No data available for analysis.</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Data Quality Analysis: {snapshot?.name}
      </Typography>

      <AnalysisAccordions>
        <DataQualityPanel data={data} columns={columns} />
        <StatisticsPanel data={data} columns={columns} />
        <CorrelationMatrix data={data} columns={columns} />
      </AnalysisAccordions>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Visualizations
        </Typography>
        <ChartControls />
      </Paper>
    </Box>
  );
};

export default DataQualityAnalysis; 
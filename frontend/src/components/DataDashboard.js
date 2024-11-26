import React, { useEffect, useState } from 'react';
import { Chart } from 'react-google-charts';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material';

const DataDashboard = ({ rowData }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({
    numeric: [],
    categorical: []
  });

  useEffect(() => {
    if (rowData && rowData.length > 0) {
      analyzeData(rowData);
    }
  }, [rowData]);

  const analyzeData = (data) => {
    setLoading(true);
    try {
      const columnAnalysis = {};
      const numericCharts = [];
      const categoricalCharts = [];
      
      const columns = Object.keys(data[0]);

      columns.forEach(col => {
        const values = data.map(row => row[col]).filter(val => val != null);
        const isNumeric = values.some(val => typeof val === 'number');

        if (isNumeric) {
          // Numeric analysis
          const numbers = values.map(v => Number(v)).filter(n => !isNaN(n));
          
          // Create histogram data
          const min = Math.min(...numbers);
          const max = Math.max(...numbers);
          const bucketSize = (max - min) / 10;
          const buckets = Array(10).fill(0);
          
          numbers.forEach(n => {
            const bucketIndex = Math.min(Math.floor((n - min) / bucketSize), 9);
            buckets[bucketIndex]++;
          });

          const histogramData = [['Value', 'Frequency']];
          buckets.forEach((count, i) => {
            const bucketStart = min + (i * bucketSize);
            histogramData.push([`${bucketStart.toFixed(2)}`, count]);
          });

          numericCharts.push({
            title: `Distribution of ${col}`,
            data: histogramData
          });

        } else {
          // Categorical analysis
          const frequencies = values.reduce((acc, val) => {
            acc[val] = (acc[val] || 0) + 1;
            return acc;
          }, {});

          const pieData = [['Category', 'Count']];
          Object.entries(frequencies)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .forEach(([category, count]) => {
              pieData.push([category, count]);
            });

          categoricalCharts.push({
            title: `Top Categories in ${col}`,
            data: pieData
          });
        }

        columnAnalysis[col] = {
          // Add your analysis results here
        };
      });

      setChartData({
        numeric: numericCharts,
        categorical: categoricalCharts
      });

      setStats({
        totalRows: data.length,
        totalColumns: columns.length,
        columnAnalysis
      });

    } catch (error) {
      console.error("Error analyzing data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Summary Card */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Dataset Summary</Typography>
              <Typography>Total Rows: {stats.totalRows}</Typography>
              <Typography>Total Columns: {stats.totalColumns}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Numeric Charts */}
        {chartData.numeric.map((chart, index) => (
          <Grid item xs={12} md={6} key={`numeric-${index}`}>
            <Paper sx={{ p: 2 }}>
              <Chart
                chartType="ColumnChart"
                width="100%"
                height="400px"
                data={chart.data}
                options={{
                  title: chart.title,
                  legend: { position: 'none' },
                  hAxis: { title: 'Value' },
                  vAxis: { title: 'Frequency' }
                }}
              />
            </Paper>
          </Grid>
        ))}

        {/* Categorical Charts */}
        {chartData.categorical.map((chart, index) => (
          <Grid item xs={12} md={6} key={`categorical-${index}`}>
            <Paper sx={{ p: 2 }}>
              <Chart
                chartType="PieChart"
                width="100%"
                height="400px"
                data={chart.data}
                options={{
                  title: chart.title,
                  pieHole: 0.4,
                  sliceVisibilityThreshold: 0.05
                }}
              />
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DataDashboard; 
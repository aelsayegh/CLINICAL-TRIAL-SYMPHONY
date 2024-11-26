const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const datasetsRouter = require('./routes/datasets');
const snapshotsRouter = require('./routes/snapshots');
const bodyParser = require('body-parser');
const adminRoutes = require('./routes/admin');
const transformationsRouter = require('./routes/transformations');
const requestLogger = require('./middleware/logging');

const app = express();
const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/clinical-trial-symphony';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    console.log('Database:', mongoose.connection.name);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(requestLogger);

app.use('/api/datasets', datasetsRouter);
app.use('/api/snapshots', snapshotsRouter);
app.use('/api/admin', adminRoutes);
app.use('/api/transformations', transformationsRouter);

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

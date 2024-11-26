import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import AdminPanel from './components/AdminPanel';
import SnapshotList from './components/SnapshotList';
import SnapshotDetail from './components/SnapshotDetail';
import DataManagementLayout from './components/layouts/DataManagementLayout';
import DatasetList from './components/DatasetList';
import DataTransformation from './components/DataTransformation';
import ExportView from './components/ExportView';
import TransformedDatasetsPage from './pages/TransformedDatasetsPage';
import TransformationEdit from './components/transformations/TransformationEdit';

function App() {
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<Navigate to="/data-management/snapshots" />} />
        
        <Route path="/data-management" element={<DataManagementLayout />}>
          <Route path="snapshots" element={<SnapshotList />} />
          <Route path="snapshots/:id" element={<SnapshotDetail />} />
          <Route path="datasets" element={<DatasetList />} />
          <Route path="transformation" element={<DataTransformation />} />
          <Route path="export" element={<ExportView />} />
          <Route path="transformed-datasets" element={<TransformedDatasetsPage />} />
        </Route>

        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/transformations/edit/:id" element={<TransformationEdit />} />
      </Routes>
    </Router>
  );
}

export default App;

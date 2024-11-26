import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layouts/MainLayout';
import SnapshotList from './components/SnapshotList';
import SnapshotDetail from './components/SnapshotDetail';
import DatasetList from './components/DatasetList';

const AppRoutes = () => {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/data-management/snapshots" replace />} />
        <Route path="/data-management">
          <Route path="snapshots" element={<SnapshotList />} />
          <Route path="snapshots/new" element={<SnapshotDetail />} />
          <Route path="snapshots/:id" element={<SnapshotDetail />} />
          <Route path="datasets" element={<DatasetList />} />
        </Route>
      </Routes>
    </MainLayout>
  );
};

export default AppRoutes; 
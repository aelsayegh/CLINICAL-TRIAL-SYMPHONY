import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const snapshotService = {
  async createSnapshot(name, description, files) {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    files.forEach(file => formData.append('files', file));

    const response = await axios.post(`${API_BASE_URL}/snapshots`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  async getSnapshots() {
    const response = await axios.get(`${API_BASE_URL}/snapshots`);
    return response.data;
  },

  async getSnapshotById(id) {
    const response = await axios.get(`${API_BASE_URL}/snapshots/${id}`);
    return response.data;
  },

  async deleteSnapshot(id) {
    await axios.delete(`${API_BASE_URL}/snapshots/${id}`);
  }
}; 
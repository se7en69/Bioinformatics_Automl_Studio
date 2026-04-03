import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 minutes for long ML operations
});

// Data endpoints
export const uploadDataset = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const getDatasets = async () => {
  const response = await api.get('/datasets');
  return response.data;
};

export const getDatasetInfo = async (datasetId) => {
  const response = await api.get(`/datasets/${datasetId}`);
  return response.data;
};

export const deleteDataset = async (datasetId) => {
  const response = await api.delete(`/datasets/${datasetId}`);
  return response.data;
};

// Preprocessing endpoints
export const preprocessData = async (params) => {
  const response = await api.post('/preprocess', params);
  return response.data;
};

// Training endpoints
export const trainModel = async (params) => {
  const response = await api.post('/train', params);
  return response.data;
};

export const getModels = async () => {
  const response = await api.get('/models');
  return response.data;
};

export const deleteModel = async (modelId) => {
  const response = await api.delete(`/models/${modelId}`);
  return response.data;
};

// Results endpoints
export const getMetrics = async (modelId) => {
  const response = await api.get(`/results/${modelId}/metrics`);
  return response.data;
};

export const getFeatureImportance = async (modelId) => {
  const response = await api.get(`/results/${modelId}/feature-importance`);
  return response.data;
};

export const getConfusionMatrixPlot = async (modelId) => {
  const response = await api.get(`/results/${modelId}/confusion-matrix`);
  return response.data;
};

export const getFeatureImportancePlot = async (modelId, topN = 20) => {
  const response = await api.get(`/results/${modelId}/feature-importance-plot`, {
    params: { top_n: topN }
  });
  return response.data;
};

export const getPCAPlot = async (modelId) => {
  const response = await api.get(`/results/${modelId}/pca`);
  return response.data;
};

// Export endpoints
export const exportResultsCSV = (modelId) => {
  return `${API_BASE_URL}/results/${modelId}/export/csv`;
};

export const exportModel = (modelId) => {
  return `${API_BASE_URL}/results/${modelId}/export/model`;
};

export default api;

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import { uploadDataset } from '../services/api';

const UploadPage = ({ appState, updateState }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  };

  const handleFile = async (file) => {
    // Validate file type
    const validTypes = ['.csv', '.tsv', '.txt'];
    const fileExt = '.' + file.name.split('.').pop().toLowerCase();
    if (!validTypes.includes(fileExt)) {
      setError('Please upload a CSV or TSV file');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const response = await uploadDataset(file);
      updateState({
        datasetId: response.dataset_id,
        datasetInfo: response.info,
        preprocessedId: null,
        preprocessInfo: null,
        modelId: null,
        modelInfo: null
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Upload Dataset</h1>
        <p className="page-subtitle">
          Upload your biological dataset (CSV/TSV) to begin analysis
        </p>
      </header>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="card">
        <div
          className={`upload-zone ${isDragging ? 'drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".csv,.tsv,.txt"
            style={{ display: 'none' }}
          />
          
          {isUploading ? (
            <>
              <div className="spinner" style={{ margin: '0 auto 1rem' }} />
              <p className="upload-zone-title">Uploading...</p>
            </>
          ) : (
            <>
              <Upload size={48} className="upload-zone-icon" />
              <p className="upload-zone-title">
                Drop your file here or click to browse
              </p>
              <p className="upload-zone-text">
                Supports CSV and TSV files (gene expression matrices, tabular data)
              </p>
            </>
          )}
        </div>
      </div>

      {appState.datasetInfo && (
        <div className="card">
          <div className="card-header">
            <FileSpreadsheet className="card-icon" size={24} />
            <h2 className="card-title">Dataset Preview</h2>
            <span className="status-badge success">
              <CheckCircle size={14} />
              Uploaded
            </span>
          </div>

          <div className="info-grid">
            <div className="info-item">
              <div className="info-value">{appState.datasetInfo.rows}</div>
              <div className="info-label">Samples</div>
            </div>
            <div className="info-item">
              <div className="info-value">{appState.datasetInfo.columns}</div>
              <div className="info-label">Features</div>
            </div>
            <div className="info-item">
              <div className="info-value">{appState.datasetInfo.numeric_columns.length}</div>
              <div className="info-label">Numeric</div>
            </div>
            <div className="info-item">
              <div className="info-value">{appState.datasetInfo.categorical_columns.length}</div>
              <div className="info-label">Categorical</div>
            </div>
          </div>

          <div className="data-preview">
            <table className="preview-table">
              <thead>
                <tr>
                  {appState.datasetInfo.column_names.slice(0, 8).map((col, i) => (
                    <th key={i}>{col}</th>
                  ))}
                  {appState.datasetInfo.column_names.length > 8 && (
                    <th>... +{appState.datasetInfo.column_names.length - 8} more</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {appState.datasetInfo.preview.slice(0, 5).map((row, i) => (
                  <tr key={i}>
                    {appState.datasetInfo.column_names.slice(0, 8).map((col, j) => (
                      <td key={j}>
                        {row[col] !== null ? String(row[col]).slice(0, 20) : '-'}
                      </td>
                    ))}
                    {appState.datasetInfo.column_names.length > 8 && (
                      <td>...</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/preprocess')}
            >
              Continue to Preprocessing →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadPage;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, AlertCircle, Info } from 'lucide-react';
import { preprocessData } from '../services/api';

const PreprocessPage = ({ appState, updateState }) => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  
  const [config, setConfig] = useState({
    targetColumn: '',
    missingValueMethod: 'mean',
    normalizationMethod: 'standard',
    testSize: 0.2
  });

  const handlePreprocess = async () => {
    if (!config.targetColumn) {
      setError('Please select a target column');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const response = await preprocessData({
        dataset_id: appState.datasetId,
        target_column: config.targetColumn,
        missing_value_method: config.missingValueMethod,
        normalization_method: config.normalizationMethod,
        test_size: config.testSize
      });

      updateState({
        preprocessedId: response.preprocessed_id,
        preprocessInfo: {
          trainSamples: response.train_samples,
          testSamples: response.test_samples,
          featureCount: response.feature_count,
          targetClasses: response.target_classes
        },
        modelId: null,
        modelInfo: null
      });

      navigate('/training');
    } catch (err) {
      setError(err.response?.data?.detail || 'Preprocessing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!appState.datasetInfo) {
    return (
      <div className="page">
        <div className="alert alert-info">
          <Info size={20} />
          <span>Please upload a dataset first</span>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Data Preprocessing</h1>
        <p className="page-subtitle">
          Configure preprocessing options for your dataset
        </p>
      </header>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="two-columns">
        <div className="card">
          <div className="card-header">
            <Settings className="card-icon" size={24} />
            <h2 className="card-title">Configuration</h2>
          </div>

          <div className="form-group">
            <label className="form-label">Target Column (Label)</label>
            <select
              className="form-select"
              value={config.targetColumn}
              onChange={(e) => setConfig({ ...config, targetColumn: e.target.value })}
            >
              <option value="">Select target column...</option>
              {appState.datasetInfo.column_names.map((col) => (
                <option key={col} value={col}>
                  {col} ({appState.datasetInfo.column_types[col]})
                </option>
              ))}
            </select>
            <small style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'block' }}>
              For classification: select the column containing class labels (e.g., "cancer" vs "normal")
            </small>
          </div>

          <div className="form-group">
            <label className="form-label">Missing Value Handling</label>
            <select
              className="form-select"
              value={config.missingValueMethod}
              onChange={(e) => setConfig({ ...config, missingValueMethod: e.target.value })}
            >
              <option value="mean">Replace with Mean</option>
              <option value="median">Replace with Median</option>
              <option value="zero">Replace with Zero</option>
              <option value="drop">Drop Rows with Missing Values</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Normalization Method</label>
            <select
              className="form-select"
              value={config.normalizationMethod}
              onChange={(e) => setConfig({ ...config, normalizationMethod: e.target.value })}
            >
              <option value="standard">Standard Scaling (Z-score)</option>
              <option value="minmax">Min-Max Scaling (0-1)</option>
              <option value="none">No Normalization</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Test Set Size: {Math.round(config.testSize * 100)}%</label>
            <input
              type="range"
              min="0.1"
              max="0.4"
              step="0.05"
              value={config.testSize}
              onChange={(e) => setConfig({ ...config, testSize: parseFloat(e.target.value) })}
              style={{ width: '100%' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <span>Train: {Math.round((1 - config.testSize) * 100)}%</span>
              <span>Test: {Math.round(config.testSize * 100)}%</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <Info className="card-icon" size={24} />
            <h2 className="card-title">Dataset Summary</h2>
          </div>

          <div className="info-grid">
            <div className="info-item">
              <div className="info-value">{appState.datasetInfo.rows}</div>
              <div className="info-label">Total Samples</div>
            </div>
            <div className="info-item">
              <div className="info-value">{appState.datasetInfo.columns - 1}</div>
              <div className="info-label">Features</div>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Numeric Columns ({appState.datasetInfo.numeric_columns.length})
            </h4>
            <div style={{ 
              maxHeight: '100px', 
              overflowY: 'auto', 
              fontSize: '0.8125rem',
              color: 'var(--text-secondary)',
              background: 'var(--bg-secondary)',
              padding: '0.5rem',
              borderRadius: '6px'
            }}>
              {appState.datasetInfo.numeric_columns.join(', ') || 'None'}
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Categorical Columns ({appState.datasetInfo.categorical_columns.length})
            </h4>
            <div style={{ 
              maxHeight: '100px', 
              overflowY: 'auto', 
              fontSize: '0.8125rem',
              color: 'var(--text-secondary)',
              background: 'var(--bg-secondary)',
              padding: '0.5rem',
              borderRadius: '6px'
            }}>
              {appState.datasetInfo.categorical_columns.join(', ') || 'None'}
            </div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'right', marginTop: '1rem' }}>
        <button
          className="btn btn-primary"
          onClick={handlePreprocess}
          disabled={isProcessing || !config.targetColumn}
        >
          {isProcessing ? (
            <>
              <div className="spinner" />
              Processing...
            </>
          ) : (
            'Preprocess Data →'
          )}
        </button>
      </div>
    </div>
  );
};

export default PreprocessPage;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, AlertCircle, Info, Cpu, CheckCircle } from 'lucide-react';
import { trainModel } from '../services/api';

const TrainingPage = ({ appState, updateState }) => {
  const navigate = useNavigate();
  const [isTraining, setIsTraining] = useState(false);
  const [error, setError] = useState(null);
  
  const [config, setConfig] = useState({
    modelType: 'random_forest',
    // Random Forest params
    nEstimators: 100,
    maxDepth: '',
    // SVM params
    svmC: 1.0,
    kernel: 'rbf',
    // Logistic Regression params
    lrC: 1.0,
    maxIter: 1000,
    // K-Means params
    nClusters: 3
  });

  const modelOptions = [
    { value: 'random_forest', label: 'Random Forest', description: 'Ensemble method, good for most tasks' },
    { value: 'svm', label: 'Support Vector Machine', description: 'Effective for high-dimensional data' },
    { value: 'logistic_regression', label: 'Logistic Regression', description: 'Simple and interpretable' },
    { value: 'kmeans', label: 'K-Means Clustering', description: 'Unsupervised clustering' }
  ];

  const getHyperparameters = () => {
    switch (config.modelType) {
      case 'random_forest':
        return {
          n_estimators: config.nEstimators,
          max_depth: config.maxDepth ? parseInt(config.maxDepth) : null
        };
      case 'svm':
        return {
          C: config.svmC,
          kernel: config.kernel
        };
      case 'logistic_regression':
        return {
          C: config.lrC,
          max_iter: config.maxIter
        };
      case 'kmeans':
        return {
          n_clusters: config.nClusters
        };
      default:
        return {};
    }
  };

  const handleTrain = async () => {
    setIsTraining(true);
    setError(null);

    try {
      const response = await trainModel({
        preprocessed_id: appState.preprocessedId,
        model_type: config.modelType,
        hyperparameters: getHyperparameters()
      });

      updateState({
        modelId: response.model_id,
        modelInfo: {
          modelType: config.modelType,
          trainingTime: response.training_time
        }
      });

      navigate('/results');
    } catch (err) {
      setError(err.response?.data?.detail || 'Training failed');
    } finally {
      setIsTraining(false);
    }
  };

  if (!appState.preprocessInfo) {
    return (
      <div className="page">
        <div className="alert alert-info">
          <Info size={20} />
          <span>Please preprocess your data first</span>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Train Model</h1>
        <p className="page-subtitle">
          Select and configure your machine learning model
        </p>
      </header>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="two-columns">
        <div>
          <div className="card">
            <div className="card-header">
              <Cpu className="card-icon" size={24} />
              <h2 className="card-title">Model Selection</h2>
            </div>

            <div className="form-group">
              <label className="form-label">Algorithm</label>
              {modelOptions.map((model) => (
                <div
                  key={model.value}
                  onClick={() => setConfig({ ...config, modelType: model.value })}
                  style={{
                    padding: '1rem',
                    marginBottom: '0.5rem',
                    background: config.modelType === model.value 
                      ? 'rgba(79, 70, 229, 0.15)' 
                      : 'var(--bg-secondary)',
                    border: config.modelType === model.value 
                      ? '1px solid var(--accent-primary)' 
                      : '1px solid var(--border-color)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {config.modelType === model.value && (
                      <CheckCircle size={16} style={{ color: 'var(--accent-primary)' }} />
                    )}
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {model.label}
                    </span>
                  </div>
                  <p style={{ 
                    fontSize: '0.8125rem', 
                    color: 'var(--text-secondary)', 
                    marginTop: '0.25rem',
                    marginLeft: config.modelType === model.value ? '1.5rem' : 0
                  }}>
                    {model.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <Play className="card-icon" size={24} />
              <h2 className="card-title">Hyperparameters</h2>
            </div>

            {config.modelType === 'random_forest' && (
              <>
                <div className="form-group">
                  <label className="form-label">Number of Trees</label>
                  <input
                    type="number"
                    className="form-input"
                    value={config.nEstimators}
                    onChange={(e) => setConfig({ ...config, nEstimators: parseInt(e.target.value) || 100 })}
                    min="10"
                    max="500"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Depth (empty = unlimited)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={config.maxDepth}
                    onChange={(e) => setConfig({ ...config, maxDepth: e.target.value })}
                    placeholder="Unlimited"
                    min="1"
                    max="50"
                  />
                </div>
              </>
            )}

            {config.modelType === 'svm' && (
              <>
                <div className="form-group">
                  <label className="form-label">Regularization (C)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={config.svmC}
                    onChange={(e) => setConfig({ ...config, svmC: parseFloat(e.target.value) || 1.0 })}
                    step="0.1"
                    min="0.01"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Kernel</label>
                  <select
                    className="form-select"
                    value={config.kernel}
                    onChange={(e) => setConfig({ ...config, kernel: e.target.value })}
                  >
                    <option value="rbf">RBF (Radial Basis Function)</option>
                    <option value="linear">Linear</option>
                    <option value="poly">Polynomial</option>
                  </select>
                </div>
              </>
            )}

            {config.modelType === 'logistic_regression' && (
              <>
                <div className="form-group">
                  <label className="form-label">Regularization (C)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={config.lrC}
                    onChange={(e) => setConfig({ ...config, lrC: parseFloat(e.target.value) || 1.0 })}
                    step="0.1"
                    min="0.01"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Iterations</label>
                  <input
                    type="number"
                    className="form-input"
                    value={config.maxIter}
                    onChange={(e) => setConfig({ ...config, maxIter: parseInt(e.target.value) || 1000 })}
                    min="100"
                    max="10000"
                  />
                </div>
              </>
            )}

            {config.modelType === 'kmeans' && (
              <div className="form-group">
                <label className="form-label">Number of Clusters</label>
                <input
                  type="number"
                  className="form-input"
                  value={config.nClusters}
                  onChange={(e) => setConfig({ ...config, nClusters: parseInt(e.target.value) || 3 })}
                  min="2"
                  max="20"
                />
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <Info className="card-icon" size={24} />
            <h2 className="card-title">Training Data Summary</h2>
          </div>

          <div className="info-grid">
            <div className="info-item">
              <div className="info-value">{appState.preprocessInfo.trainSamples}</div>
              <div className="info-label">Training Samples</div>
            </div>
            <div className="info-item">
              <div className="info-value">{appState.preprocessInfo.testSamples}</div>
              <div className="info-label">Test Samples</div>
            </div>
            <div className="info-item">
              <div className="info-value">{appState.preprocessInfo.featureCount}</div>
              <div className="info-label">Features</div>
            </div>
            <div className="info-item">
              <div className="info-value">{appState.preprocessInfo.targetClasses?.length || '?'}</div>
              <div className="info-label">Classes</div>
            </div>
          </div>

          {appState.preprocessInfo.targetClasses && (
            <div>
              <h4 style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                Class Labels
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {appState.preprocessInfo.targetClasses.map((cls, i) => (
                  <span
                    key={i}
                    style={{
                      padding: '0.25rem 0.75rem',
                      background: 'var(--bg-secondary)',
                      borderRadius: '9999px',
                      fontSize: '0.8125rem',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    {cls}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: '2rem' }}>
            <button
              className="btn btn-primary"
              onClick={handleTrain}
              disabled={isTraining}
              style={{ width: '100%', padding: '1rem' }}
            >
              {isTraining ? (
                <>
                  <div className="spinner" />
                  Training Model...
                </>
              ) : (
                <>
                  <Play size={20} />
                  Start Training
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingPage;

import React, { useState, useEffect } from 'react';
import { BarChart3, Download, AlertCircle, Info, TrendingUp, Grid } from 'lucide-react';
import Plot from 'react-plotly.js';
import { 
  getMetrics, 
  getConfusionMatrixPlot, 
  getFeatureImportancePlot, 
  getPCAPlot,
  exportResultsCSV,
  exportModel
} from '../services/api';

const ResultsPage = ({ appState }) => {
  const [metrics, setMetrics] = useState(null);
  const [confusionMatrix, setConfusionMatrix] = useState(null);
  const [featureImportance, setFeatureImportance] = useState(null);
  const [pcaData, setPcaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('metrics');

  useEffect(() => {
    if (appState.modelId) {
      loadResults();
    }
  }, [appState.modelId]);

  const loadResults = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [metricsRes, cmRes, fiRes, pcaRes] = await Promise.all([
        getMetrics(appState.modelId),
        getConfusionMatrixPlot(appState.modelId),
        getFeatureImportancePlot(appState.modelId, 15).catch(() => null),
        getPCAPlot(appState.modelId)
      ]);
      
      setMetrics(metricsRes);
      setConfusionMatrix(cmRes.data);
      setFeatureImportance(fiRes?.data || null);
      setPcaData(pcaRes.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  if (!appState.modelId) {
    return (
      <div className="page">
        <div className="alert alert-info">
          <Info size={20} />
          <span>Please train a model first</span>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem', width: '40px', height: '40px' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Loading results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'metrics', label: 'Metrics', icon: BarChart3 },
    { id: 'confusion', label: 'Confusion Matrix', icon: Grid },
    { id: 'features', label: 'Feature Importance', icon: TrendingUp },
    { id: 'pca', label: 'PCA Visualization', icon: BarChart3 }
  ];

  return (
    <div className="page">
      <header className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">Model Results</h1>
            <p className="page-subtitle">
              {appState.modelInfo?.modelType?.replace('_', ' ').toUpperCase()} - 
              Trained in {appState.modelInfo?.trainingTime}s
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <a 
              href={exportResultsCSV(appState.modelId)} 
              className="btn btn-secondary"
              download
            >
              <Download size={16} />
              Export CSV
            </a>
            <a 
              href={exportModel(appState.modelId)} 
              className="btn btn-secondary"
              download
            >
              <Download size={16} />
              Export Model
            </a>
          </div>
        </div>
      </header>

      {/* Metrics Cards */}
      {metrics && (
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-value">{(metrics.accuracy * 100).toFixed(1)}%</div>
            <div className="metric-label">Accuracy</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{(metrics.precision * 100).toFixed(1)}%</div>
            <div className="metric-label">Precision</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{(metrics.recall * 100).toFixed(1)}%</div>
            <div className="metric-label">Recall</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{(metrics.f1_score * 100).toFixed(1)}%</div>
            <div className="metric-label">F1 Score</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        marginBottom: '1.5rem',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '0.5rem'
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              background: activeTab === tab.id ? 'rgba(79, 70, 229, 0.15)' : 'transparent',
              border: 'none',
              borderRadius: '8px',
              color: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.875rem'
            }}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'metrics' && metrics && (
        <div className="card">
          <div className="card-header">
            <BarChart3 className="card-icon" size={24} />
            <h2 className="card-title">Classification Report</h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="preview-table">
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Precision</th>
                  <th>Recall</th>
                  <th>F1-Score</th>
                  <th>Support</th>
                </tr>
              </thead>
              <tbody>
                {metrics.class_labels.map((label, i) => {
                  const report = metrics.classification_report[String(i)] || metrics.classification_report[label];
                  return report ? (
                    <tr key={label}>
                      <td style={{ fontWeight: 600 }}>{label}</td>
                      <td>{(report.precision * 100).toFixed(1)}%</td>
                      <td>{(report.recall * 100).toFixed(1)}%</td>
                      <td>{(report['f1-score'] * 100).toFixed(1)}%</td>
                      <td>{report.support}</td>
                    </tr>
                  ) : null;
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'confusion' && confusionMatrix && (
        <div className="plot-container">
          <div className="plot-title">Confusion Matrix</div>
          <Plot
            data={[{
              z: confusionMatrix.z,
              x: confusionMatrix.x,
              y: confusionMatrix.y,
              type: 'heatmap',
              colorscale: 'Blues',
              showscale: true
            }]}
            layout={{
              width: 600,
              height: 500,
              paper_bgcolor: 'transparent',
              plot_bgcolor: 'transparent',
              font: { color: '#f8fafc' },
              xaxis: { title: 'Predicted', gridcolor: '#334155' },
              yaxis: { title: 'Actual', gridcolor: '#334155', autorange: 'reversed' },
              annotations: confusionMatrix.annotations?.map(ann => ({
                ...ann,
                font: { color: ann.font?.color || 'white', size: 14 }
              }))
            }}
            config={{ displayModeBar: false }}
          />
        </div>
      )}

      {activeTab === 'features' && (
        <div className="plot-container">
          <div className="plot-title">Top Feature Importance (Gene Importance)</div>
          {featureImportance ? (
            <Plot
              data={[{
                x: featureImportance.x,
                y: featureImportance.y,
                type: 'bar',
                orientation: 'h',
                marker: {
                  color: 'rgb(79, 70, 229)',
                  line: { color: 'rgb(99, 102, 241)', width: 1 }
                }
              }]}
              layout={{
                width: 800,
                height: 500,
                paper_bgcolor: 'transparent',
                plot_bgcolor: 'transparent',
                font: { color: '#f8fafc' },
                xaxis: { title: 'Importance Score', gridcolor: '#334155' },
                yaxis: { gridcolor: '#334155' },
                margin: { l: 200 }
              }}
              config={{ displayModeBar: false }}
            />
          ) : (
            <p style={{ color: 'var(--text-secondary)', padding: '2rem', textAlign: 'center' }}>
              Feature importance not available for this model type
            </p>
          )}
        </div>
      )}

      {activeTab === 'pca' && pcaData && (
        <div className="plot-container">
          <div className="plot-title">
            PCA Visualization 
            <span style={{ fontWeight: 400, fontSize: '0.875rem', marginLeft: '0.5rem', color: 'var(--text-secondary)' }}>
              (Variance explained: PC1 {(pcaData.explained_variance[0] * 100).toFixed(1)}%, 
              PC2 {(pcaData.explained_variance[1] * 100).toFixed(1)}%)
            </span>
          </div>
          <Plot
            data={pcaData.traces}
            layout={{
              width: 800,
              height: 600,
              paper_bgcolor: 'transparent',
              plot_bgcolor: 'var(--bg-secondary)',
              font: { color: '#f8fafc' },
              xaxis: { 
                title: pcaData.layout?.xaxis?.title || 'PC1',
                gridcolor: '#334155',
                zerolinecolor: '#334155'
              },
              yaxis: { 
                title: pcaData.layout?.yaxis?.title || 'PC2',
                gridcolor: '#334155',
                zerolinecolor: '#334155'
              },
              legend: { 
                bgcolor: 'transparent',
                font: { color: '#f8fafc' }
              },
              showlegend: true
            }}
            config={{ displayModeBar: false }}
          />
        </div>
      )}
    </div>
  );
};

export default ResultsPage;

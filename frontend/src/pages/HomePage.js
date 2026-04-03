import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Dna, 
  Upload, 
  PlayCircle, 
  BarChart3, 
  Github, 
  Globe,
  ArrowRight,
  Sparkles,
  Cpu,
  Database
} from 'lucide-react';
import './HomePage.css';

const HomePage = ({ appState }) => {
  const navigate = useNavigate();

  const actionCards = [
    {
      icon: Upload,
      title: 'Upload Dataset',
      description: 'Import your CSV/TSV biological data files for analysis',
      action: () => navigate('/upload'),
      color: '#4f46e5'
    },
    {
      icon: PlayCircle,
      title: 'Start New Analysis',
      description: 'Configure preprocessing and train machine learning models',
      action: () => navigate('/upload'),
      color: '#10b981'
    },
    {
      icon: BarChart3,
      title: 'View Results',
      description: 'Explore metrics, visualizations, and export findings',
      action: () => appState.modelId ? navigate('/results') : navigate('/upload'),
      color: '#f59e0b'
    }
  ];

  const features = [
    { icon: Database, text: 'Gene Expression Analysis' },
    { icon: Cpu, text: 'Multiple ML Algorithms' },
    { icon: Sparkles, text: 'No Coding Required' }
  ];

  return (
    <div className="home-page">
      <div className="home-content">
        {/* Hero Section */}
        <header className="hero-section">
          <div className="hero-icon">
            <Dna size={56} />
          </div>
          <h1 className="hero-title">Bioinformatics AutoML Studio</h1>
          <p className="hero-subtitle">
            Train machine learning models on biological datasets without coding
          </p>
          <div className="feature-tags">
            {features.map((feature, index) => (
              <span key={index} className="feature-tag">
                <feature.icon size={14} />
                {feature.text}
              </span>
            ))}
          </div>
        </header>

        {/* Action Cards */}
        <section className="action-cards">
          {actionCards.map((card, index) => (
            <div 
              key={index} 
              className="action-card"
              onClick={card.action}
              style={{ '--card-color': card.color }}
            >
              <div className="action-card-icon">
                <card.icon size={28} />
              </div>
              <h3 className="action-card-title">{card.title}</h3>
              <p className="action-card-description">{card.description}</p>
              <div className="action-card-arrow">
                <ArrowRight size={18} />
              </div>
            </div>
          ))}
        </section>

        {/* Quick Stats */}
        <section className="quick-stats">
          <div className="stat-card">
            <div className="stat-value">4</div>
            <div className="stat-label">ML Algorithms</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">CSV/TSV</div>
            <div className="stat-label">File Support</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">100%</div>
            <div className="stat-label">Offline</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">Free</div>
            <div className="stat-label">Open Source</div>
          </div>
        </section>

        {/* Pipeline Status */}
        {appState.datasetId && (
          <section className="current-session">
            <h3>Current Session</h3>
            <div className="session-info">
              <div className="session-item">
                <span className="session-label">Dataset:</span>
                <span className="session-value">{appState.datasetInfo?.filename || 'Loaded'}</span>
              </div>
              {appState.preprocessedId && (
                <div className="session-item">
                  <span className="session-label">Status:</span>
                  <span className="session-value status-ready">Preprocessed</span>
                </div>
              )}
              {appState.modelId && (
                <div className="session-item">
                  <span className="session-label">Model:</span>
                  <span className="session-value">{appState.modelInfo?.modelType?.replace('_', ' ')}</span>
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-developed">
            <span className="footer-label">Developed by</span>
            <span className="footer-name">Abdul Rehman Ikram</span>
          </div>
          <p className="footer-contact">
            Please feel free to contact us with any issues, comments, or questions.
          </p>
          <div className="footer-links">
            <a 
              href="https://github.com/se7en69" 
              target="_blank" 
              rel="noopener noreferrer"
              className="footer-link"
            >
              <Github size={16} />
              GitHub
            </a>
            <a 
              href="https://abdul7.netlify.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="footer-link"
            >
              <Globe size={16} />
              Portfolio
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;

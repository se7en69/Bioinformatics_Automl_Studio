import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Upload, 
  Settings, 
  Play, 
  BarChart3, 
  Dna,
  CheckCircle,
  Circle,
  Home
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ appState }) => {
  const location = useLocation();
  
  const navItems = [
    { 
      path: '/', 
      icon: Home, 
      label: 'Home',
      completed: false,
      isHome: true
    },
    { 
      path: '/upload', 
      icon: Upload, 
      label: 'Upload Data',
      completed: !!appState.datasetId
    },
    { 
      path: '/preprocess', 
      icon: Settings, 
      label: 'Preprocessing',
      completed: !!appState.preprocessedId,
      disabled: !appState.datasetId
    },
    { 
      path: '/training', 
      icon: Play, 
      label: 'Train Model',
      completed: !!appState.modelId,
      disabled: !appState.preprocessedId
    },
    { 
      path: '/results', 
      icon: BarChart3, 
      label: 'Results',
      completed: false,
      disabled: !appState.modelId
    }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Dna className="sidebar-logo" size={32} />
        <div className="sidebar-brand">
          <h1>BioML</h1>
          <span>AutoML</span>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.disabled ? '#' : item.path}
            className={({ isActive }) => 
              `nav-item ${isActive ? 'active' : ''} ${item.disabled ? 'disabled' : ''}`
            }
            onClick={(e) => item.disabled && e.preventDefault()}
          >
            <item.icon size={20} className="nav-icon" />
            <span className="nav-label">{item.label}</span>
            {!item.isHome && (
              item.completed ? (
                <CheckCircle size={16} className="nav-status completed" />
              ) : (
                <Circle size={16} className="nav-status" />
              )
            )}
          </NavLink>
        ))}
      </nav>
      
      <div className="sidebar-footer">
        <div className="pipeline-status">
          <span className="status-label">Pipeline Status</span>
          <div className="status-steps">
            <div className={`step ${appState.datasetId ? 'completed' : ''}`} />
            <div className={`step ${appState.preprocessedId ? 'completed' : ''}`} />
            <div className={`step ${appState.modelId ? 'completed' : ''}`} />
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import UploadPage from './pages/UploadPage';
import PreprocessPage from './pages/PreprocessPage';
import TrainingPage from './pages/TrainingPage';
import ResultsPage from './pages/ResultsPage';
import './styles/App.css';
import './pages/HomePage.css';

function App() {
  const [appState, setAppState] = useState({
    datasetId: null,
    datasetInfo: null,
    preprocessedId: null,
    preprocessInfo: null,
    modelId: null,
    modelInfo: null
  });

  const updateState = (updates) => {
    setAppState(prev => ({ ...prev, ...updates }));
  };

  return (
    <Router>
      <div className="app">
        <Sidebar appState={appState} />
        <main className="main-content">
          <Routes>
            <Route 
              path="/" 
              element={
                <HomePage 
                  appState={appState}
                />
              } 
            />
            <Route 
              path="/upload"
              element={
                <UploadPage 
                  appState={appState} 
                  updateState={updateState} 
                />
              } 
            />
            <Route 
              path="/preprocess" 
              element={
                <PreprocessPage 
                  appState={appState} 
                  updateState={updateState} 
                />
              } 
            />
            <Route 
              path="/training" 
              element={
                <TrainingPage 
                  appState={appState} 
                  updateState={updateState} 
                />
              } 
            />
            <Route 
              path="/results" 
              element={
                <ResultsPage 
                  appState={appState} 
                />
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

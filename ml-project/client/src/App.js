/**
 * Main App Component
 * Driving Behavior Prediction Application
 */

import React from 'react';
import PredictionForm from './components/PredictionForm';
import './App.css';

function App() {
  return (
    <div className="app">
      <div className="container">
        {/* Header */}
        <header className="header">
          <h1>Driving Behavior Prediction</h1>
          <p className="subtitle">
            Enter your trip details to classify your driving style as 
            <span className="badge aggressive">Aggressive</span>
            <span className="badge normal">Normal</span> or 
            <span className="badge relaxed">Relaxed</span>
          </p>
        </header>

        {/* Main Prediction Form */}
        <main>
          <PredictionForm />
        </main>


      </div>
    </div>
  );
}

export default App;

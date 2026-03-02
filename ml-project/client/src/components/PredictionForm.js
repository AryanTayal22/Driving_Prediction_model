/**
 * PredictionForm Component
 * Handles user input and displays prediction results
 */

import React, { useState } from 'react';
import axios from 'axios';
import './PredictionForm.css';

// API endpoint (Node.js backend)
// Use environment variable in production, localhost in development
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Initial form state with default values
const initialFormState = {
  trip_distance_km: '',
  overspeed_ms: '',
  night_driving_ms: '',
  rapid_acceleration: '',
  sharp_turns: '',
  sudden_stops: '',
  trip_duration_ms: ''
};

// Sample data for quick testing
const sampleData = {
  aggressive: {
    trip_distance_km: 45,
    overspeed_ms: 450000,
    night_driving_ms: 2700000,
    rapid_acceleration: 35,
    sharp_turns: 30,
    sudden_stops: 20,
    trip_duration_ms: 5400000
  },
  normal: {
    trip_distance_km: 30,
    overspeed_ms: 120000,
    night_driving_ms: 1200000,
    rapid_acceleration: 12,
    sharp_turns: 10,
    sudden_stops: 6,
    trip_duration_ms: 4500000
  },
  relaxed: {
    trip_distance_km: 25,
    overspeed_ms: 25000,
    night_driving_ms: 450000,
    rapid_acceleration: 2,
    sharp_turns: 3,
    sudden_stops: 2,
    trip_duration_ms: 5000000
  }
};

function PredictionForm() {
  // State management
  const [formData, setFormData] = useState(initialFormState);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  // Load sample data
  const loadSampleData = (type) => {
    setFormData(sampleData[type]);
    setError(null);
    setResult(null);
  };

  // Validate form data
  const validateForm = () => {
    for (const key of Object.keys(formData)) {
      if (formData[key] === '' || formData[key] === null) {
        setError(`Please fill in all fields. Missing: ${key.replace(/_/g, ' ')}`);
        return false;
      }
      if (isNaN(Number(formData[key]))) {
        setError(`Invalid value for ${key.replace(/_/g, ' ')}. Must be a number.`);
        return false;
      }
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Convert string values to appropriate types
      const payload = {
        trip_distance_km: parseFloat(formData.trip_distance_km),
        overspeed_ms: parseFloat(formData.overspeed_ms),
        night_driving_ms: parseFloat(formData.night_driving_ms),
        rapid_acceleration: parseInt(formData.rapid_acceleration),
        sharp_turns: parseInt(formData.sharp_turns),
        sudden_stops: parseInt(formData.sudden_stops),
        trip_duration_ms: parseFloat(formData.trip_duration_ms)
      };

      // Send request to backend
      const response = await axios.post(`${API_URL}/api/predict`, payload);
      
      if (response.data.success) {
        setResult(response.data.data);
      } else {
        setError(response.data.message || 'Prediction failed');
      }
    } catch (err) {
      console.error('Prediction error:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.code === 'ERR_NETWORK') {
        setError('Cannot connect to server. Please ensure the backend is running.');
      } else {
        setError('An error occurred while getting prediction.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setFormData(initialFormState);
    setResult(null);
    setError(null);
  };

  // Get result card class based on prediction
  const getResultClass = () => {
    if (!result) return '';
    const prediction = result.prediction?.toLowerCase();
    return `result-${prediction}`;
  };

  return (
    <div className="prediction-form-container">
      {/* Sample Data Buttons */}
      <div className="sample-buttons">
        <span>Load sample data:</span>
        <button type="button" onClick={() => loadSampleData('aggressive')} className="sample-btn aggressive">
          Aggressive
        </button>
        <button type="button" onClick={() => loadSampleData('normal')} className="sample-btn normal">
          Normal
        </button>
        <button type="button" onClick={() => loadSampleData('relaxed')} className="sample-btn relaxed">
          Relaxed
        </button>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="prediction-form">
        <div className="form-grid">
          {/* Trip Distance */}
          <div className="form-group">
            <label htmlFor="trip_distance_km">
              Trip Distance (km)
            </label>
            <input
              type="number"
              id="trip_distance_km"
              name="trip_distance_km"
              value={formData.trip_distance_km}
              onChange={handleChange}
              placeholder="e.g., 25.5"
              step="0.1"
              min="0"
            />
          </div>

          {/* Trip Duration */}
          <div className="form-group">
            <label htmlFor="trip_duration_ms">
              Trip Duration (ms)
            </label>
            <input
              type="number"
              id="trip_duration_ms"
              name="trip_duration_ms"
              value={formData.trip_duration_ms}
              onChange={handleChange}
              placeholder="e.g., 3600000 (1 hour)"
              min="0"
            />
          </div>

          {/* Overspeed Duration */}
          <div className="form-group">
            <label htmlFor="overspeed_ms">
              Overspeed Duration (ms)
            </label>
            <input
              type="number"
              id="overspeed_ms"
              name="overspeed_ms"
              value={formData.overspeed_ms}
              onChange={handleChange}
              placeholder="e.g., 120000 (2 min)"
              min="0"
            />
          </div>

          {/* Night Driving */}
          <div className="form-group">
            <label htmlFor="night_driving_ms">
              Night Driving (ms)
            </label>
            <input
              type="number"
              id="night_driving_ms"
              name="night_driving_ms"
              value={formData.night_driving_ms}
              onChange={handleChange}
              placeholder="e.g., 900000 (15 min)"
              min="0"
            />
          </div>

          {/* Rapid Acceleration */}
          <div className="form-group">
            <label htmlFor="rapid_acceleration">
              Rapid Accelerations
            </label>
            <input
              type="number"
              id="rapid_acceleration"
              name="rapid_acceleration"
              value={formData.rapid_acceleration}
              onChange={handleChange}
              placeholder="e.g., 8"
              min="0"
            />
          </div>

          {/* Sharp Turns */}
          <div className="form-group">
            <label htmlFor="sharp_turns">
              Sharp Turns
            </label>
            <input
              type="number"
              id="sharp_turns"
              name="sharp_turns"
              value={formData.sharp_turns}
              onChange={handleChange}
              placeholder="e.g., 5"
              min="0"
            />
          </div>

          {/* Sudden Stops */}
          <div className="form-group full-width">
            <label htmlFor="sudden_stops">
              Sudden Stops
            </label>
            <input
              type="number"
              id="sudden_stops"
              name="sudden_stops"
              value={formData.sudden_stops}
              onChange={handleChange}
              placeholder="e.g., 3"
              min="0"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="form-actions">
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Predicting...
              </>
            ) : (
              'Predict Driving Style'
            )}
          </button>
          <button type="button" className="reset-btn" onClick={handleReset}>
            Reset
          </button>
        </div>
      </form>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className={`result-card ${getResultClass()}`}>
          <div className="result-header">
            <h3>Prediction Result</h3>
            <span className={`result-badge ${result.prediction?.toLowerCase()}`}>
              {result.prediction?.toUpperCase()}
            </span>
          </div>
          
          <div className="result-body">
            <p className="result-message">{result.message}</p>
            
            <div className="result-details">
              <div className="detail-item">
                <span className="detail-label">Confidence</span>
                <span className="detail-value">{(result.confidence * 100).toFixed(0)}%</span>
              </div>
            </div>

            {/* Confidence Bar */}
            <div className="confidence-bar">
              <div 
                className="confidence-fill" 
                style={{ width: `${result.confidence * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PredictionForm;

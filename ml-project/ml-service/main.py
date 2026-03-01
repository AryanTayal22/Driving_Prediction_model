"""
FastAPI ML Service for Driving Behavior Classification
This service loads a trained ML model and provides predictions via REST API
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib
import numpy as np
from sklearn.preprocessing import RobustScaler
import os

# Initialize FastAPI app
app = FastAPI(
    title="Driving Behavior Prediction API",
    description="Classify driving behavior as aggressive, normal, or relaxed",
    version="1.0.0"
)

# Enable CORS for all origins (adjust in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for model and scaler
model = None
scaler = None

# Input schema with validation
class DrivingInput(BaseModel):
    """
    Input schema for driving behavior prediction
    All fields represent driving metrics from a trip
    """
    trip_distance_km: float = Field(..., gt=0, description="Trip distance in kilometers")
    overspeed_ms: float = Field(..., ge=0, description="Overspeeding duration in milliseconds")
    night_driving_ms: float = Field(..., ge=0, description="Night driving duration in milliseconds")
    rapid_acceleration: int = Field(..., ge=0, description="Count of rapid accelerations")
    sharp_turns: int = Field(..., ge=0, description="Count of sharp turns")
    sudden_stops: int = Field(..., ge=0, description="Count of sudden stops")
    trip_duration_ms: float = Field(..., gt=0, description="Trip duration in milliseconds")

    class Config:
        json_schema_extra = {
            "example": {
                "trip_distance_km": 25.5,
                "overspeed_ms": 120000,
                "night_driving_ms": 900000,
                "rapid_acceleration": 8,
                "sharp_turns": 5,
                "sudden_stops": 3,
                "trip_duration_ms": 3600000
            }
        }

# Response schema
class PredictionResponse(BaseModel):
    """Response schema for prediction endpoint"""
    prediction: str
    confidence: float
    input_features: dict
    message: str

def preprocess_features(data: DrivingInput) -> np.ndarray:
    """
    Preprocess input features to match training data transformations
    This must match the preprocessing done during model training
    """
    # Apply the same transformations as during training
    night_driving_processed = data.night_driving_ms * 0.001 * 0.167 * 0.2
    overspeed_processed = data.overspeed_ms * 0.001 * 0.167
    trip_duration_processed = data.trip_duration_ms * 0.001 * 0.167
    sudden_stops_processed = data.sudden_stops * 2

    # Create feature array in the same order as training
    features = np.array([[
        data.trip_distance_km,
        overspeed_processed,
        night_driving_processed,
        data.rapid_acceleration,
        data.sharp_turns,
        sudden_stops_processed,
        trip_duration_processed
    ]])
    
    return features

def generate_training_data_for_scaler():
    """
    Generate synthetic data matching the training distribution to fit the scaler.
    This recreates the preprocessing done during training.
    """
    np.random.seed(42)
    num_samples = 5000
    
    all_data = []
    
    # Aggressive driving data
    for _ in range(num_samples):
        night_driving_ms = np.random.uniform(1800000, 3600000) * 0.001 * 0.167 * 0.2
        overspeed_ms = np.random.uniform(200000, 600000) * 0.001 * 0.167
        trip_duration_ms = max(night_driving_ms / 0.2 / 0.167 * 1000, overspeed_ms / 0.167 * 1000) + np.random.uniform(0, 7200000)
        trip_duration_ms = trip_duration_ms * 0.001 * 0.167
        all_data.append([
            np.random.uniform(2, 70),  # trip_distance_km
            overspeed_ms,
            night_driving_ms,
            np.random.randint(20, 50),  # rapid_acceleration
            np.random.randint(20, 50),  # sharp_turns
            np.random.randint(10, 30) * 2,  # sudden_stops (weighted)
            trip_duration_ms
        ])
    
    # Normal driving data
    for _ in range(num_samples):
        night_driving_ms = np.random.uniform(900000, 1800000) * 0.001 * 0.167 * 0.2
        overspeed_ms = np.random.uniform(50000, 200000) * 0.001 * 0.167
        trip_duration_ms = max(night_driving_ms / 0.2 / 0.167 * 1000, overspeed_ms / 0.167 * 1000) + np.random.uniform(0, 7200000)
        trip_duration_ms = trip_duration_ms * 0.001 * 0.167
        all_data.append([
            np.random.uniform(2, 70),
            overspeed_ms,
            night_driving_ms,
            np.random.randint(5, 20),
            np.random.randint(5, 20),
            np.random.randint(5, 10) * 2,
            trip_duration_ms
        ])
    
    # Relaxed driving data
    for _ in range(num_samples):
        night_driving_ms = np.random.uniform(0, 900000) * 0.001 * 0.167 * 0.2
        overspeed_ms = np.random.uniform(0, 50000) * 0.001 * 0.167
        trip_duration_ms = max(night_driving_ms / 0.2 / 0.167 * 1000, overspeed_ms / 0.167 * 1000) + np.random.uniform(0, 7200000)
        trip_duration_ms = trip_duration_ms * 0.001 * 0.167
        all_data.append([
            np.random.uniform(2, 70),
            overspeed_ms,
            night_driving_ms,
            np.random.randint(0, 5),
            np.random.randint(0, 5),
            np.random.randint(0, 5) * 2,
            trip_duration_ms
        ])
    
    return np.array(all_data)

@app.on_event("startup")
async def load_model():
    """Load the ML model and scaler when the server starts"""
    global model, scaler
    
    # Path to the model file
    model_path = os.path.join(os.path.dirname(__file__), "model.pkl")
    
    if not os.path.exists(model_path):
        print(f"Warning: Model file not found at {model_path}")
        print("Please copy your driving_score_model2.pkl to ml-service/model.pkl")
        return
    
    try:
        # Load the trained model and scaler
        loaded_data = joblib.load(model_path)
        
        # Handle if model is stored in a dictionary
        if isinstance(loaded_data, dict):
            # Extract the KNN model from the dictionary
            if 'knn' in loaded_data:
                model = loaded_data['knn']
                print(f"✅ KNN model extracted from dictionary")
            
            # Extract the scaler if saved
            if 'scaler' in loaded_data:
                scaler = loaded_data['scaler']
                print(f"✅ Scaler loaded from pickle file")
            else:
                # Fallback: fit scaler on synthetic data
                scaler = RobustScaler()
                synthetic_data = generate_training_data_for_scaler()
                scaler.fit(synthetic_data)
                print(f"✅ Scaler fitted on {len(synthetic_data)} synthetic samples")
        else:
            model = loaded_data
            # Fallback: fit scaler on synthetic data
            scaler = RobustScaler()
            synthetic_data = generate_training_data_for_scaler()
            scaler.fit(synthetic_data)
            print(f"✅ Scaler fitted on {len(synthetic_data)} synthetic samples")
        
        print(f"✅ Model loaded successfully from {model_path}")
        print(f"   Model type: {type(model).__name__}")
        
    except Exception as e:
        print(f"❌ Error loading model: {e}")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "message": "Driving Behavior Prediction API is running",
        "model_loaded": model is not None
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "model_status": "loaded" if model is not None else "not loaded",
        "scaler_status": "ready" if scaler is not None else "not ready"
    }

@app.post("/predict", response_model=PredictionResponse)
async def predict(input_data: DrivingInput):
    """
    Predict driving behavior based on input features
    
    Returns:
        - prediction: One of 'aggressive', 'normal', or 'relaxed'
        - confidence: Confidence score of the prediction
        - input_features: The processed input features
        - message: Human-readable message about the prediction
    """
    # Check if model is loaded
    if model is None:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Please ensure model.pkl exists in the ml-service directory."
        )
    
    try:
        # Preprocess the input features
        features = preprocess_features(input_data)
        
        # Scale features using the fitted RobustScaler
        features_scaled = scaler.transform(features)
        
        # Make prediction
        prediction = model.predict(features_scaled)[0]
        
        # Get prediction probabilities if available
        confidence = 0.85  # Default confidence
        if hasattr(model, 'predict_proba'):
            probabilities = model.predict_proba(features_scaled)[0]
            confidence = float(max(probabilities))
        
        # Create human-readable message
        messages = {
            "aggressive": "⚠️ Aggressive driving detected! Consider safer driving habits.",
            "normal": "✅ Normal driving behavior. Keep it up!",
            "relaxed": "🌟 Excellent! Very relaxed and safe driving style."
        }
        
        return PredictionResponse(
            prediction=prediction,
            confidence=round(confidence, 2),
            input_features=input_data.model_dump(),
            message=messages.get(prediction, "Prediction complete")
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction error: {str(e)}"
        )

# Run the server (for development)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)

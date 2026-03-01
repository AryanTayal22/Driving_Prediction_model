# 🚗 Driving Behavior Prediction - Full Stack ML Application

A complete full-stack web application that demonstrates a Machine Learning model for classifying driving behavior as **Aggressive**, **Normal**, or **Relaxed**.

## 📋 Table of Contents

- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Folder Structure](#-folder-structure)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Sample Test Data](#-sample-test-data)
- [Deployment](#-deployment)

---

## 🏗 Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  React Frontend │────▶│  Node/Express   │────▶│  FastAPI ML     │
│  (Port 3000)    │     │  (Port 5000)    │     │  (Port 8000)    │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                                                ┌─────────────────┐
                                                │  ML Model       │
                                                │  (.pkl file)    │
                                                └─────────────────┘
```

**Flow:**
1. User enters driving data in React frontend
2. Frontend sends POST request to Node.js backend
3. Node.js forwards request to Python FastAPI service
4. FastAPI loads the ML model and makes prediction
5. Result flows back to frontend and is displayed

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React.js, Axios, CSS |
| **Backend** | Node.js, Express.js |
| **ML Service** | Python, FastAPI, scikit-learn |
| **ML Model** | KNN Classifier (joblib/pickle) |

---

## 📂 Folder Structure

```
ml-project/
│
├── client/                    # React Frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── PredictionForm.js
│   │   │   └── PredictionForm.css
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
│
├── server/                    # Node.js Backend
│   ├── controllers/
│   │   └── predictController.js
│   ├── routes/
│   │   └── predict.js
│   ├── server.js
│   ├── .env
│   └── package.json
│
├── ml-service/                # Python ML Service
│   ├── main.py
│   ├── model.pkl              # Your trained model (copy here)
│   └── requirements.txt
│
└── README.md
```

---

## ✅ Prerequisites

Make sure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.8 or higher) - [Download](https://python.org/)
- **npm** (comes with Node.js)
- **pip** (comes with Python)

---

## 📦 Installation

### 1. Clone/Setup the Project

```bash
cd ml-project
```

### 2. Setup ML Service (Python)

```bash
# Navigate to ml-service directory
cd ml-service

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy your trained model
# Copy your 'driving_score_model2.pkl' file and rename it to 'model.pkl'
```

### 3. Setup Node.js Backend

```bash
# Navigate to server directory
cd ../server

# Install dependencies
npm install
```

### 4. Setup React Frontend

```bash
# Navigate to client directory
cd ../client

# Install dependencies
npm install
```

---

## 🚀 Running the Application

You need to run all three services. Open **3 separate terminals**:

### Terminal 1: ML Service (Python FastAPI)

```bash
cd ml-project/ml-service

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Run the service
uvicorn main:app --reload --port 8000
```

**Expected output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Started reloader process
✅ Model loaded successfully
```

### Terminal 2: Node.js Backend

```bash
cd ml-project/server

# Run with nodemon (auto-reload)
npm run dev

# Or run normally
npm start
```

**Expected output:**
```
🚀 Server is running on http://localhost:5000
📡 ML Service URL: http://localhost:8000
🌍 Environment: development
```

### Terminal 3: React Frontend

```bash
cd ml-project/client

npm start
```

**Expected output:**
```
Compiled successfully!
You can now view driving-behavior-client in the browser.
  Local: http://localhost:3000
```

---

## 📡 API Documentation

### Python ML Service (Port 8000)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/health` | GET | Detailed health status |
| `/predict` | POST | Make prediction |

### Node.js Backend (Port 5000)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/health` | GET | Server status |
| `/api/predict` | POST | Forward prediction request |
| `/api/predict/health` | GET | Check ML service connectivity |

---

## 🧪 Sample Test Data

### Input JSON Format

```json
{
  "trip_distance_km": 25.5,
  "overspeed_ms": 120000,
  "night_driving_ms": 900000,
  "rapid_acceleration": 8,
  "sharp_turns": 5,
  "sudden_stops": 3,
  "trip_duration_ms": 3600000
}
```

### Field Descriptions

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `trip_distance_km` | float | Distance traveled in km | 25.5 |
| `overspeed_ms` | float | Time spent overspeeding (ms) | 120000 (2 min) |
| `night_driving_ms` | float | Night driving duration (ms) | 900000 (15 min) |
| `rapid_acceleration` | int | Count of rapid accelerations | 8 |
| `sharp_turns` | int | Count of sharp turns | 5 |
| `sudden_stops` | int | Count of sudden stops | 3 |
| `trip_duration_ms` | float | Total trip duration (ms) | 3600000 (1 hour) |

### Sample Data by Category

**Aggressive Driver:**
```json
{
  "trip_distance_km": 45,
  "overspeed_ms": 450000,
  "night_driving_ms": 2700000,
  "rapid_acceleration": 35,
  "sharp_turns": 30,
  "sudden_stops": 20,
  "trip_duration_ms": 5400000
}
```

**Normal Driver:**
```json
{
  "trip_distance_km": 30,
  "overspeed_ms": 120000,
  "night_driving_ms": 1200000,
  "rapid_acceleration": 12,
  "sharp_turns": 10,
  "sudden_stops": 6,
  "trip_duration_ms": 4500000
}
```

**Relaxed Driver:**
```json
{
  "trip_distance_km": 25,
  "overspeed_ms": 25000,
  "night_driving_ms": 450000,
  "rapid_acceleration": 2,
  "sharp_turns": 3,
  "sudden_stops": 2,
  "trip_duration_ms": 5000000
}
```

### Example Response

```json
{
  "success": true,
  "data": {
    "prediction": "normal",
    "confidence": 0.85,
    "input_features": {
      "trip_distance_km": 30,
      "overspeed_ms": 120000,
      "night_driving_ms": 1200000,
      "rapid_acceleration": 12,
      "sharp_turns": 10,
      "sudden_stops": 6,
      "trip_duration_ms": 4500000
    },
    "message": "✅ Normal driving behavior. Keep it up!"
  }
}
```

---

## 🧪 Testing with cURL

```bash
# Test ML Service directly
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"trip_distance_km": 30, "overspeed_ms": 120000, "night_driving_ms": 1200000, "rapid_acceleration": 12, "sharp_turns": 10, "sudden_stops": 6, "trip_duration_ms": 4500000}'

# Test through Node.js backend
curl -X POST http://localhost:5000/api/predict \
  -H "Content-Type: application/json" \
  -d '{"trip_distance_km": 30, "overspeed_ms": 120000, "night_driving_ms": 1200000, "rapid_acceleration": 12, "sharp_turns": 10, "sudden_stops": 6, "trip_duration_ms": 4500000}'
```

---

## 🚀 Deployment (Optional)

### Docker Deployment

Create a `docker-compose.yml` in the root:

```yaml
version: '3.8'

services:
  ml-service:
    build: ./ml-service
    ports:
      - "8000:8000"
    
  server:
    build: ./server
    ports:
      - "5000:5000"
    environment:
      - ML_SERVICE_URL=http://ml-service:8000
    depends_on:
      - ml-service
    
  client:
    build: ./client
    ports:
      - "3000:3000"
    depends_on:
      - server
```

### Production Considerations

1. **Environment Variables**: Use proper secrets management
2. **CORS**: Restrict origins in production
3. **HTTPS**: Use SSL certificates
4. **Rate Limiting**: Add request rate limiting
5. **Logging**: Implement proper logging
6. **Monitoring**: Add health checks and monitoring

---

## 🤝 Troubleshooting

### Common Issues

1. **Model not loaded error**
   - Ensure `model.pkl` exists in `ml-service/` directory
   - Check if the model was saved with compatible scikit-learn version

2. **CORS errors**
   - Verify CORS is enabled in both Node.js and FastAPI
   - Check the allowed origins configuration

3. **Connection refused**
   - Make sure all three services are running
   - Check if ports 3000, 5000, and 8000 are available

4. **Prediction errors**
   - Verify input data format matches expected schema
   - Check server logs for detailed error messages

---

## 📝 License

MIT License - Feel free to use and modify!

---

**Built with ❤️ using React, Node.js, and FastAPI**

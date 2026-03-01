/**
 * Prediction Controller
 * Handles the logic for prediction requests
 * Communicates with the Python ML service
 */

const axios = require('axios');

// ML Service base URL from environment variables
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

/**
 * Get driving behavior prediction from ML service
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPrediction = async (req, res) => {
    try {
        const inputData = req.body;
        
        console.log('📊 Received prediction request:', inputData);

        // Forward request to Python ML service
        const response = await axios.post(
            `${ML_SERVICE_URL}/predict`,
            inputData,
            {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10000 // 10 second timeout
            }
        );

        console.log('✅ ML Service response:', response.data);

        // Return the prediction result
        res.json({
            success: true,
            data: response.data
        });

    } catch (error) {
        console.error('❌ Prediction error:', error.message);

        // Handle different error scenarios
        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({
                success: false,
                error: 'ML Service Unavailable',
                message: 'Cannot connect to the ML service. Please ensure it is running on port 8000.'
            });
        }

        if (error.response) {
            // ML service returned an error
            return res.status(error.response.status).json({
                success: false,
                error: 'ML Service Error',
                message: error.response.data.detail || 'Error from ML service'
            });
        }

        // Generic error
        res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: error.message
        });
    }
};

/**
 * Check ML service health
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const checkMLServiceHealth = async (req, res) => {
    try {
        const response = await axios.get(`${ML_SERVICE_URL}/health`, {
            timeout: 5000
        });

        res.json({
            success: true,
            node_server: 'healthy',
            ml_service: response.data
        });

    } catch (error) {
        res.status(503).json({
            success: false,
            node_server: 'healthy',
            ml_service: 'unavailable',
            message: 'Cannot connect to ML service'
        });
    }
};

module.exports = {
    getPrediction,
    checkMLServiceHealth
};

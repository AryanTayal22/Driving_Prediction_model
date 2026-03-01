/**
 * Prediction Routes
 * Handles all /api/predict related endpoints
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const predictController = require('../controllers/predictController');

// Validation rules for prediction input
const validatePredictionInput = [
    body('trip_distance_km')
        .isFloat({ gt: 0 })
        .withMessage('Trip distance must be a positive number'),
    body('overspeed_ms')
        .isFloat({ min: 0 })
        .withMessage('Overspeed must be a non-negative number'),
    body('night_driving_ms')
        .isFloat({ min: 0 })
        .withMessage('Night driving duration must be a non-negative number'),
    body('rapid_acceleration')
        .isInt({ min: 0 })
        .withMessage('Rapid acceleration count must be a non-negative integer'),
    body('sharp_turns')
        .isInt({ min: 0 })
        .withMessage('Sharp turns count must be a non-negative integer'),
    body('sudden_stops')
        .isInt({ min: 0 })
        .withMessage('Sudden stops count must be a non-negative integer'),
    body('trip_duration_ms')
        .isFloat({ gt: 0 })
        .withMessage('Trip duration must be a positive number')
];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation Error',
            details: errors.array()
        });
    }
    next();
};

/**
 * @route   POST /api/predict
 * @desc    Get driving behavior prediction
 * @access  Public
 */
router.post(
    '/predict',
    validatePredictionInput,
    handleValidationErrors,
    predictController.getPrediction
);

/**
 * @route   GET /api/predict/health
 * @desc    Check ML service health
 * @access  Public
 */
router.get('/predict/health', predictController.checkMLServiceHealth);

module.exports = router;

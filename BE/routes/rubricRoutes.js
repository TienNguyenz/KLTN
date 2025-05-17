/* eslint-disable no-undef */
// Route: Rubric & Rubric Evaluation
const express = require('express');
const router = express.Router();
const rubricController = require('../controllers/rubricController');
const rubricEvaluationController = require('../controllers/rubricEvaluationController');

// Rubric routes
router.get('/rubrics', rubricController.getAllRubrics);
router.get('/rubrics/:id', rubricController.getRubricById);
router.post('/rubrics', rubricController.createRubric);
router.put('/rubrics/:id', rubricController.updateRubric);
router.delete('/rubrics/:id', rubricController.deleteRubric);

// Rubric Evaluation routes
router.get('/evaluations', rubricEvaluationController.getAllEvaluations);
router.get('/evaluations/rubric/:rubricId', rubricEvaluationController.getEvaluationsByRubricId);
router.get('/evaluations/:id', rubricEvaluationController.getEvaluationById);
router.post('/evaluations', rubricEvaluationController.createEvaluation);
router.put('/evaluations/:id', rubricEvaluationController.updateEvaluation);
router.delete('/evaluations/:id', rubricEvaluationController.deleteEvaluation);

module.exports = router; 
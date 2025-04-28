const Council = require('../models/Council');
const Major = require('../models/Major');
const mongoose = require('mongoose');

// Get all councils
exports.getAllCouncils = async (req, res) => {
    try {
        const councils = await Council.find()
            .populate('assembly_major', 'major_title')
            .populate('chairman', 'user_id user_name')
            .populate('secretary', 'user_id user_name')
            .populate('members', 'user_id user_name');
        res.status(200).json(councils);
    } catch (error) {
        res.status(500).json({ message: 'Error getting councils' });
    }
};

// Create new council
exports.createCouncil = async (req, res) => {
    try {
        const council = new Council({
            assembly_name: req.body.assembly_name,
            assembly_major: req.body.assembly_major,
            chairman: req.body.chairman,
            secretary: req.body.secretary,
            members: req.body.members,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        const newCouncil = await council.save();
        const populatedCouncil = await Council.findById(newCouncil._id)
            .populate('assembly_major', 'major_title')
            .populate('chairman', 'user_id user_name')
            .populate('secretary', 'user_id user_name')
            .populate('members', 'user_id user_name');
        res.status(201).json(populatedCouncil);
    } catch (error) {
        if (error.code === 11000 && error.keyPattern && error.keyPattern.assembly_name) {
            return res.status(400).json({ message: 'Tên hội đồng đã tồn tại!' });
        }
        res.status(400).json({ message: 'Error creating council' });
    }
};

// Update council
exports.updateCouncil = async (req, res) => {
    try {
        const council = await Council.findById(req.params.id);
        if (!council) {
            return res.status(404).json({ message: 'Council not found' });
        }
        council.assembly_name = req.body.assembly_name || council.assembly_name;
        council.assembly_major = req.body.assembly_major || council.assembly_major;
        council.chairman = req.body.chairman || council.chairman;
        council.secretary = req.body.secretary || council.secretary;
        council.members = req.body.members || council.members;
        council.updatedAt = new Date();
        const updatedCouncil = await council.save();
        const populatedCouncil = await Council.findById(updatedCouncil._id)
            .populate('assembly_major', 'major_title')
            .populate('chairman', 'user_id user_name')
            .populate('secretary', 'user_id user_name')
            .populate('members', 'user_id user_name');
        res.json(populatedCouncil);
    } catch (error) {
        res.status(400).json({ message: 'Error updating council' });
    }
};

// Delete council
exports.deleteCouncil = async (req, res) => {
    try {
        const council = await Council.findById(req.params.id);
        if (!council) {
            return res.status(404).json({ message: 'Council not found' });
        }
        await council.deleteOne();
        res.json({ message: 'Council deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting council' });
    }
}; 
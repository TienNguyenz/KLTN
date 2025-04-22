const Council = require('../models/Council');

// Get all councils
exports.getAllCouncils = async (req, res) => {
    try {
        const councils = await Council.find();
        res.status(200).json(councils);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create new council
exports.createCouncil = async (req, res) => {
    const council = new Council({
        name: req.body.name,
        chairman: req.body.chairman,
        secretary: req.body.secretary,
        members: req.body.members
    });

    try {
        const newCouncil = await council.save();
        res.status(201).json(newCouncil);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update council
exports.updateCouncil = async (req, res) => {
    try {
        const council = await Council.findById(req.params.id);
        if (!council) {
            return res.status(404).json({ message: 'Council not found' });
        }

        council.name = req.body.name || council.name;
        council.chairman = req.body.chairman || council.chairman;
        council.secretary = req.body.secretary || council.secretary;
        council.members = req.body.members || council.members;
        council.updated_at = Date.now();

        const updatedCouncil = await council.save();
        res.json(updatedCouncil);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete council
exports.deleteCouncil = async (req, res) => {
    try {
        const council = await Council.findById(req.params.id);
        if (!council) {
            return res.status(404).json({ message: 'Council not found' });
        }

        await council.remove();
        res.json({ message: 'Council deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 
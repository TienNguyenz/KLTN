const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/KLTN', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

// Import routes
const semesterRoutes = require('./routes/semester');
const registrationPeriodRoutes = require('./routes/registrationPeriod');
const authRoutes = require('./routes/auth');
const databaseRoutes = require('./routes/database');
const rubricRoutes = require('./routes/rubricRoutes');
const topicRoutes = require('./routes/topic');
const userRoutes = require('./routes/user');
const seedRoutes = require('./routes/seed');
const userNotificationRoutes = require('./routes/userNotification');
const councilRoutes = require('./routes/councilRoutes');

// Basic route
app.get('/', (req, res) => {
  res.send('Welcome to KLTN API');
});

// Use routes
app.use('/api/semesters', semesterRoutes);
app.use('/api/registrationperiods', registrationPeriodRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/database', databaseRoutes);
app.use('/api', rubricRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/users', userRoutes);
app.use('/api', seedRoutes);
app.use('/api/notifications', userNotificationRoutes);
app.use('/api', councilRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        message: 'Something went wrong!',
        error: err.message 
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
 
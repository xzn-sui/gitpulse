require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const reposRouter = require('./routes/repos');
const bookmarksRouter = require('./routes/bookmarks');

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/repos', reposRouter);
app.use('/bookmarks', bookmarksRouter);

// Home route
app.get('/', (req, res) => {
  res.render('index', { title: 'GitPulse' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`GitPulse running on port ${PORT}`));

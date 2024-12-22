// Import required packages
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

// Initialize the Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from 'public'

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Define a schema and model for user registration and login
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  selectedImage: { type: Number, required: true }, // Store the selected image number
});

const User = mongoose.model('User', userSchema);

// Register Route (POST /api/register)
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, selectedImage } = req.body;
    if (!name || !email || !password || !selectedImage) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists.' });
    }
    const newUser = new User({ name, email, password, selectedImage });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Login Route (POST /api/login)
app.post('/api/login', async (req, res) => {
  try {
    const { email, password, selectedImage } = req.body;
    if (!email || !password || !selectedImage) {
      return res.status(400).json({ error: 'Email, password, and image selection are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'User not found.' });
    }

    // Ensure the password and selectedImage are correct
    if (user.password !== password || user.selectedImage.toString() !== selectedImage) {
      return res.status(400).json({ error: 'Incorrect email, password, or image selection.' });
    }

    // If everything matches, proceed with login
    res.status(200).json({ message: 'Login successful!' });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});


// Other imports and middleware as you have them...

// Home Route (GET /home)
app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});
app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});
app.get('/logout', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

const express = require('express');
const mongoose = require('mongoose');
const Application = require('./models/appModel');
const User = require('./models/userModel');
const bcrypt = require('bcrypt');
const auth = require('./authMiddleware');
const jwt = require('jsonwebtoken');
const app = express();
const port = 3000;
const cors = require('cors');
require('dotenv').config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Default route
app.get('/', (request, response) => {
  response.send('Hello API');
});

// Get all applications
app.get('/application', auth, async (request, response) => {
  if (!request.user.isAdmin) {
    return response.status(403).json({ message: 'Forbidden Authentication, Access denied' });
  }
  try {
    const applications = await Application.find({});
    response.status(200).json(applications);
  } catch (error) {
    console.log(error.message);
    response.status(500).json({ message: error.message });
  }
});

// Get one application
app.get('/application/:id', auth, async (request, response) => {
  try {
    const { id } = request.params;
    const application = await Application.findById(id);
    response.status(200).json(application);
  } catch (error) {
    console.log(error.message);
    response.status(500).json({ message: error.message });
  }
});

// Send application
app.post('/application', async (request, response) => {
  try {
    const application = await Application.create(request.body);
    response.status(201).json(application);
  } catch (error) {
    console.log(error.message);
    response.status(500).json({ message: error.message });
  }
});

// Update application
app.put('/application/:id', async (request, response) => {
  try {
    const { id } = request.params;
    const application = await Application.findByIdAndUpdate(id, request.body, { new: true });

    if (!application) {
      return response.status(404).json({ message: `Application of id ${id} not found` });
    }

    response.status(200).json(application);
  } catch (error) {
    console.log(error.message);
    response.status(500).json({ message: error.message });
  }
});

// Delete application
app.delete('/application/:id', auth, async (request, response) => {
  if (!request.user.isAdmin) {
    return response.status(403).json({ message: 'Forbidden Authentication, Access denied' });
  }
  try {
    const { id } = request.params;
    const application = await Application.findByIdAndDelete(id);

    if (!application) {
      return response.status(404).json({ message: `Application of id ${id} not found` });
    }

    response.status(200).json({ message: `Application of id ${id} deleted` });
  } catch (error) {
    console.log(error.message);
    response.status(500).json({ message: error.message });
  }
});

// Register user
app.post('/register', async (request, response) => {
  try {
    const hashedPassword = await bcrypt.hash(request.body.password, 10);
    const user = new User({
      username: request.body.username,
      password: hashedPassword,
      isAdmin: request.body.isAdmin,
    });
    const savedUser = await user.save();
    response.status(201).json(savedUser);
  } catch (error) {
    response.status(500).json({ message: error.message });
  }
});

// Login user
app.post('/login', async (request, response) => {
  try {
    const user = await User.findOne({ username: request.body.username });

    if (!user) {
      return response.status(400).json({ message: 'User Not Found!' });
    }

    const validPassword = await bcrypt.compare(request.body.password, user.password);

    if (!validPassword) {
      return response.status(400).json({ message: 'Invalid password' });
    }

    const token = jwt.sign({ _id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: '1h' });
    response.status(200).json({ token: token });
  } catch (error) {
    response.status(500).json({ message: error.message });
  }
});

mongoose.set('strictQuery', false);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(port, () => {
      console.log(`Node API is running on ${port}`);
    });
  })
  .catch(() => {
    console.log('MongoDB connection failed');
  });

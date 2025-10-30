const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();


const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const jobRoutes = require('./routes/jobRoutes');
const userProfileRoutes = require('./routes/userProfileRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/profile', userProfileRoutes);
app.use('/api/applications', applicationRoutes);

async function startServer() {
  try {
    await sequelize.authenticate({ logging: false });
    console.log('✅ Connection to the database has been established successfully.');

    await sequelize.sync({ alter: true, logging: false });
    console.log('✅ Database synchronized.');

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
 
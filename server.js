require('dotenv').config();
const app = require('./src/app');
const { sequelize } = require('./src/config/database');

const PORT = process.env.PORT || 5000;

// Database sync
sequelize.sync().then(() => {
  console.log('Database synced');
}).catch(err => {
  console.error('Error syncing database:', err);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
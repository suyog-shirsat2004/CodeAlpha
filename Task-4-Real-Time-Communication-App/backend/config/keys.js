module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'realtime_app_jwt_secret_key_2024',
  jwtExpire: '7d',
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/realtime-communication-app',
  port: process.env.PORT || 5001,
};

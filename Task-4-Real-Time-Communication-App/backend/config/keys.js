module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'realtime_app_jwt_secret_key_2024',
  jwtExpire: '7d',
  port: process.env.PORT || 5001,
};

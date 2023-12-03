const fs = require('fs');
const crypto = require('crypto');

const generateRandomString = () => {
  return crypto.randomBytes(32).toString('hex');
};

const jwtSecret = generateRandomString();


fs.writeFileSync('.env', `JWT_SECRET=${jwtSecret}\n`, { flag: 'a' });

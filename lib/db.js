import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const db = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT || 6379),
  password: process.env.REDIS_PASSWORD,
});

db.on('error', (e) => {
  console.log('errror');
  console.log(e);
});

db.on('connect', () => {
  console.log('Connect');
});

export default db;

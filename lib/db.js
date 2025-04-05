import Redis from 'ioredis';

const DB_URL =
  'rediss://default:AcNDAAIjcDE5ZDM1OGE1YjEyYjc0YWZiODllYmRmNGI5OTM3ZWZhMnAxMA@honest-snail-49987.upstash.io:6379';

const db = new Redis(DB_URL);

export default db;

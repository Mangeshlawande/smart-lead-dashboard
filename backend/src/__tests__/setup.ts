import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongod: MongoMemoryServer;

// Set test env vars before anything loads
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-must-be-at-least-32-chars!!';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-must-be-at-least-32-chars!!';
process.env.JWT_EXPIRES_IN = '1h';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.MONGODB_URI = 'mongodb://placeholder/test'; // overridden in beforeAll
process.env.FRONTEND_URL = 'http://localhost:5173';
process.env.BCRYPT_SALT_ROUNDS = '4'; // fast hashing in tests

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  process.env.MONGODB_URI = uri;
  await mongoose.connect(uri);
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
});

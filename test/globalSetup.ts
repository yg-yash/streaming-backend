import { MongoMemoryServer } from 'mongodb-memory-server';

module.exports = async function () {
  const instance = await MongoMemoryServer.create();
  const uri = instance.getUri();
  (global as any).__MONGOINSTANCE = instance;
  process.env.MONGO_URI = uri;
  process.env.MONGO_URI_MEM_SERVER = 'true'; // Indicate that we're using the memory server
};

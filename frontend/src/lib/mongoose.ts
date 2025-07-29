import mongoose from 'mongoose';

// Log to check if environment variables are loading
console.log('Environment variables loaded:', !!process.env.MONGODB_URI);

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// Log a sanitized version of the connection string (without password)
const sanitizedUri = MONGODB_URI.replace(/(\/\/[^:]+:)[^@]+(@)/, '$1*****$2');
console.log('MongoDB URI format:', sanitizedUri);

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global as any;

if (!cached.mongoose) {
  cached.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.mongoose.conn) {
    return cached.mongoose.conn;
  }

  if (!cached.mongoose.promise) {
    const opts = {
      bufferCommands: false,
    };

    console.log('Attempting to connect to MongoDB...');
    cached.mongoose.promise = mongoose.connect(MONGODB_URI, opts)
      .then(mongoose => {
        console.log('MongoDB connected successfully!');
        return mongoose;
      })
      .catch(err => {
        console.error('MongoDB connection error:', err);
        throw err;
      });
  }
  cached.mongoose.conn = await cached.mongoose.promise;
  return cached.mongoose.conn;
}

export default dbConnect;

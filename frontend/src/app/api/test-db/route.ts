import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function GET() {
  try {
    // Log environment variables (sanitized)
    const hasMongoUri = !!process.env.MONGODB_URI;
    console.log('Has MONGODB_URI:', hasMongoUri);
    
    if (!hasMongoUri) {
      return NextResponse.json({ 
        success: false, 
        error: 'MONGODB_URI environment variable is not defined' 
      }, { status: 500 });
    }
    
    const uri = process.env.MONGODB_URI!;
    const sanitizedUri = uri.replace(/(\\/\\/[^:]+:)[^@]+(@)/, '$1*****$2');
    console.log('MongoDB URI format:', sanitizedUri);
    
    // Test direct connection
    console.log('Testing direct MongoDB connection...');
    const connection = await mongoose.connect(uri);
    console.log('MongoDB connection successful!');
    
    // Get database information
    const dbs = await connection.connection.db.admin().listDatabases();
    console.log('Available databases:', dbs.databases.map(db => db.name));
    
    // Close connection
    await mongoose.disconnect();
    console.log('MongoDB connection closed');
    
    return NextResponse.json({ 
      success: true, 
      message: 'MongoDB connection test successful',
      databases: dbs.databases.map(db => db.name)
    }, { status: 200 });
  } catch (error) {
    console.error('MongoDB connection test failed:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: 'MongoDB connection test failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

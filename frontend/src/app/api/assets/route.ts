import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Asset from '@/models/Asset';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    // Check authentication
    const auth = await requireAuth();
    if (!auth.authorized) {
      return auth.response;
    }
    
    console.log('Connecting to MongoDB...');
    await dbConnect();
    console.log('Connected to MongoDB, fetching assets...');
    
    // Only fetch assets belonging to the authenticated user
    const assets = await Asset.find({ userId: auth.user?.id }).sort({ dateAdded: -1 });
    console.log('Assets fetched:', assets);
    
    return NextResponse.json({ success: true, data: assets }, { status: 200 });
  } catch (error) {
    console.error('Error fetching assets:', error);
    // Return more detailed error information
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch assets', 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const auth = await requireAuth();
    if (!auth.authorized) {
      return auth.response;
    }
    
    await dbConnect();
    const data = await request.json();
    
    // Add the user ID to the asset data
    const assetData = {
      ...data,
      userId: auth.user?.id || ''
    };
    
    const asset = await Asset.create(assetData);
    
    return NextResponse.json({ success: true, data: asset }, { status: 201 });
  } catch (error) {
    console.error('Error creating asset:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create asset' },
      { status: 500 }
    );
  }
}

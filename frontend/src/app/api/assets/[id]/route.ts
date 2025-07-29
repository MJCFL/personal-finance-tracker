import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Asset from '@/models/Asset';
import mongoose from 'mongoose';
import { requireAuth } from '@/lib/auth';

// Helper function to validate MongoDB ObjectId
function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const auth = await requireAuth();
    if (!auth.authorized) {
      return auth.response;
    }
    
    const { id } = params;
    
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid asset ID' },
        { status: 400 }
      );
    }
    
    await dbConnect();
    const asset = await Asset.findById(id);
    
    if (!asset) {
      return NextResponse.json(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      );
    }
    
    // Ensure user can only access their own assets
    if (asset.userId !== auth.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }
    
    return NextResponse.json({ success: true, data: asset }, { status: 200 });
  } catch (error) {
    console.error('Error fetching asset:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch asset' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const auth = await requireAuth();
    if (!auth.authorized) {
      return auth.response;
    }
    
    const { id } = params;
    
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid asset ID' },
        { status: 400 }
      );
    }
    
    const data = await request.json();
    
    await dbConnect();
    
    // First check if the asset exists and belongs to the user
    const existingAsset = await Asset.findById(id);
    
    if (!existingAsset) {
      return NextResponse.json(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      );
    }
    
    // Ensure user can only update their own assets
    if (existingAsset.userId !== auth.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }
    
    // Update lastUpdated timestamp
    data.lastUpdated = new Date();
    
    const asset = await Asset.findByIdAndUpdate(
      id,
      data,
      { new: true, runValidators: true }
    );
    
    return NextResponse.json({ success: true, data: asset }, { status: 200 });
  } catch (error) {
    console.error('Error updating asset:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update asset' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const auth = await requireAuth();
    if (!auth.authorized) {
      return auth.response;
    }
    
    const { id } = params;
    
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid asset ID' },
        { status: 400 }
      );
    }
    
    await dbConnect();
    
    // First check if the asset exists and belongs to the user
    const existingAsset = await Asset.findById(id);
    
    if (!existingAsset) {
      return NextResponse.json(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      );
    }
    
    // Ensure user can only delete their own assets
    if (existingAsset.userId !== auth.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }
    
    // Delete the asset
    await Asset.findByIdAndDelete(id);
    
    return NextResponse.json(
      { success: true, message: 'Asset deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting asset:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete asset' },
      { status: 500 }
    );
  }
}

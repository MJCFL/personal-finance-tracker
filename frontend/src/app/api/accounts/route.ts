import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Account from '@/models/Account';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET handler to fetch all accounts for the current user
export async function GET(req: NextRequest) {
  try {
    // Connect to the database
    await dbConnect();

    // Get the user session
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Extract query parameters
    const url = new URL(req.url);
    const type = url.searchParams.get('type');
    const isActive = url.searchParams.get('isActive');

    // Build query based on parameters
    const query: any = { userId: session.user.id };
    if (type) query.type = type;
    if (isActive !== null) query.isActive = isActive === 'true';

    // Fetch accounts
    const accounts = await Account.find(query).sort({ createdAt: -1 });
    
    // Map MongoDB _id to id for frontend compatibility
    const mappedAccounts = accounts.map(account => {
      const accountObj = account.toObject();
      accountObj.id = accountObj._id.toString();
      delete accountObj._id;
      return accountObj;
    });

    return NextResponse.json(mappedAccounts);
  } catch (error: any) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch accounts' },
      { status: 500 }
    );
  }
}

// POST handler to create a new account
export async function POST(req: NextRequest) {
  try {
    // Connect to the database
    await dbConnect();

    // Get the user session
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await req.json();

    // Create new account with user ID
    const account = await Account.create({
      ...body,
      userId: session.user.id,
    });
    
    // Map MongoDB _id to id for frontend compatibility
    const accountObj = account.toObject();
    accountObj.id = accountObj._id.toString();
    delete accountObj._id;

    return NextResponse.json(accountObj, { status: 201 });
  } catch (error: any) {
    console.error('Error creating account:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create account' },
      { status: 500 }
    );
  }
}

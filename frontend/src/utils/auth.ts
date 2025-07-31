import { Session } from 'next-auth';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Extended session type to include user ID
export interface ExtendedSession extends Session {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

// Get the user from the session
export async function getUserFromSession(): Promise<{ id: string } | null> {
  const session = await getServerSession(authOptions) as ExtendedSession | null;
  
  if (!session?.user?.id) {
    return null;
  }
  
  return { id: session.user.id };
}

// Middleware to protect API routes
export async function protectApiRoute(req: NextRequest) {
  const user = await getUserFromSession();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  return user;
}

// Helper to check if a user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return !!session;
}

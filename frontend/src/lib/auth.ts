import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextRequest, NextResponse } from 'next/server';
import { Session } from 'next-auth';

/**
 * Get the current session on the server
 */
export async function getSession() {
  return await getServerSession(authOptions);
}

/**
 * Check if a user is authenticated on the server
 */
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

/**
 * Middleware to check if a user is authenticated
 * Returns the user if authenticated, otherwise returns a 401 response
 */
export async function requireAuth(): Promise<{ 
  authorized: boolean; 
  user?: Session['user']; 
  response?: NextResponse 
}> {
  const user = await getCurrentUser();
  
  if (!user) {
    return { 
      authorized: false, 
      response: NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    };
  }
  
  return { authorized: true, user };
}

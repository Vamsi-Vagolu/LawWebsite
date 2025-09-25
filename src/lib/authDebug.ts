import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

export async function debugAuth(request: NextRequest) {
  console.log('\n🔍 === AUTH DEBUG START ===');
  
  try {
    // Get token
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    console.log('🎫 Token details:');
    console.log('  - token.sub:', token?.sub);
    console.log('  - token.email:', token?.email);
    console.log('  - token.name:', token?.name);
    console.log('  - Full token:', JSON.stringify(token, null, 2));

    if (!token || !token.sub) {
      console.log('❌ No valid token found');
      return { success: false, error: 'No valid token' };
    }

    // Try to find user by token.sub (ID)
    let user = await prisma.user.findUnique({
      where: { id: token.sub }
    });

    console.log('\n👤 User lookup by ID (token.sub):');
    if (user) {
      console.log('  ✅ Found user by ID:', user.id, user.email);
    } else {
      console.log('  ❌ No user found with ID:', token.sub);
    }

    // Try to find user by email if not found by ID
    if (!user && token.email) {
      user = await prisma.user.findUnique({
        where: { email: token.email }
      });

      console.log('\n👤 User lookup by email (token.email):');
      if (user) {
        console.log('  ✅ Found user by email:', user.id, user.email);
      } else {
        console.log('  ❌ No user found with email:', token.email);
      }
    }

    // Get all users for comparison
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });

    console.log('\n📊 All users in database:');
    allUsers.forEach(u => {
      console.log(`  - ID: ${u.id}, Email: ${u.email}, Name: ${u.name}`);
    });

    // Check sessions
    const sessions = await prisma.session.findMany({
      where: {
        userId: user?.id || token.sub
      },
      select: {
        id: true,
        userId: true,
        sessionToken: true,
        expires: true
      }
    });

    console.log('\n🔗 Sessions for this user:');
    if (sessions.length > 0) {
      sessions.forEach(session => {
        console.log(`  - Session ID: ${session.id}, User ID: ${session.userId}, Expires: ${session.expires}`);
      });
    } else {
      console.log('  ❌ No sessions found');
    }

    // Check accounts
    const accounts = await prisma.account.findMany({
      where: {
        userId: user?.id || token.sub
      },
      select: {
        id: true,
        userId: true,
        provider: true,
        providerAccountId: true,
        type: true
      }
    });

    console.log('\n🔗 Accounts for this user:');
    if (accounts.length > 0) {
      accounts.forEach(account => {
        console.log(`  - Account ID: ${account.id}, Provider: ${account.provider}, Type: ${account.type}`);
      });
    } else {
      console.log('  ❌ No accounts found');
    }

    console.log('\n=== AUTH DEBUG END ===\n');

    return {
      success: !!user,
      user,
      token,
      allUsers: allUsers.length,
      sessions: sessions.length,
      accounts: accounts.length
    };

  } catch (error) {
    console.error('❌ Auth debug error:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function ensureUserExists(token: any) {
  if (!token?.email) {
    throw new Error('No email in token');
  }

  // Try to find existing user
  let user = await prisma.user.findUnique({
    where: { email: token.email }
  });

  if (user) {
    console.log('✅ User exists:', user.id, user.email);
    return user;
  }

  // Create new user if not exists
  console.log('🆕 Creating new user for email:', token.email);
  
  try {
    user = await prisma.user.create({
      data: {
        email: token.email,
        name: token.name || token.email.split('@')[0],
        image: token.picture || null,
        role: 'USER' as const,
      }
    });

    console.log('✅ Created new user:', user.id, user.email);
    return user;
  } catch (error) {
    console.error('❌ Failed to create user:', error);
    
    // Try to find user again in case of race condition
    user = await prisma.user.findUnique({
      where: { email: token.email }
    });
    
    if (user) {
      console.log('✅ Found user after race condition:', user.id, user.email);
      return user;
    }
    
    throw error;
  }
}
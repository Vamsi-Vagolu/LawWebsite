import { prisma } from '@/lib/prisma';
import { JWT } from 'next-auth/jwt';

export async function findOrCreateUser(token: JWT) {
  if (!token.sub) {
    throw new Error('Invalid token - no subject');
  }

  // First, try to find user by ID
  let user = await prisma.user.findUnique({
    where: { id: token.sub }
  });

  if (user) {
    return user;
  }

  // If not found by ID, try by email
  if (token.email) {
    user = await prisma.user.findUnique({
      where: { email: token.email }
    });

    if (user) {
      return user;
    }
  }

  // If still not found and we have email, create a new user
  if (token.email) {
    try {
      user = await prisma.user.create({
        data: {
          id: token.sub, // Use the token.sub as the ID
          email: token.email,
          name: token.name || token.email.split('@')[0],
          image: token.picture || null,
        }
      });
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      // If creation fails due to ID conflict, try to find again
      user = await prisma.user.findUnique({
        where: { email: token.email }
      });
      if (user) {
        return user;
      }
      throw error;
    }
  }

  throw new Error('Unable to find or create user');
}

export async function getUserFromToken(token: JWT) {
  if (!token.sub) {
    return null;
  }

  // Try to find user by ID first
  let user = await prisma.user.findUnique({
    where: { id: token.sub }
  });

  if (user) {
    return user;
  }

  // Try by email if available
  if (token.email) {
    user = await prisma.user.findUnique({
      where: { email: token.email }
    });
  }

  return user;
}
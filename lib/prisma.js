// lib/prisma.js - Standard Singleton Pattern
import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('🔌 Initializing new Prisma Client...');
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL is undefined during Prisma initialization!');
    } else {
      const url = process.env.DATABASE_URL;
      const maskedUrl = url.substring(0, url.indexOf('@') + 1) + '***' + url.substring(url.lastIndexOf(':'));
      console.log(`🔌 Database URL: ${maskedUrl}`);
    }
  }

  return new PrismaClient({
    log: ['warn', 'error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
};

const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
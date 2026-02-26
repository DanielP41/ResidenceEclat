import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Testing connection...');
    console.log('DATABASE_URL is set to:', process.env.DATABASE_URL ? 'PRESENT (hidden)' : 'MISSING');
    
    try {
        await prisma.$connect();
        console.log('✅ Connected successfully!');
        const userCount = await prisma.user.count();
        console.log('User count:', userCount);
    } catch (error) {
        console.error('❌ Connection failed:');
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

main();

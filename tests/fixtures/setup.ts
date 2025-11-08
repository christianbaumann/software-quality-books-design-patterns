import prisma from '../../src/lib/db'
import bcrypt from 'bcryptjs'

export const TEST_USER = {
    id: 'test-user-001',
    email: 'testuser@example.com',
    password: 'password123'
}

export const TEST_BOOK = {
    id: 'test-book-001',
    title: 'The Great Adventure'
}

export async function initializeTestData() {
    try {
        await prisma.user.findUniqueOrThrow({where: {email: TEST_USER.email}})
    } catch {
        try {
            const hashedPassword = await bcrypt.hash(TEST_USER.password, 10)
            await prisma.user.create({
                data: {
                    id: TEST_USER.id,
                    email: TEST_USER.email,
                    password: hashedPassword,
                    profile: {create: {name: 'Test User'}}
                }
            })

            await prisma.book.create({
                data: {
                    id: TEST_BOOK.id,
                    title: TEST_BOOK.title,
                    description: 'An exciting adventure story',
                    userId: TEST_USER.id
                }
            })
        } catch (error: any) {
            if (error.code !== 'P2002') {
                throw error
            }
        }
    }
}

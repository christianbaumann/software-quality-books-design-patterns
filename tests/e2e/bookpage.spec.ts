import {expect} from '@playwright/test'
import {Book} from '@prisma/client'
import {faker} from '@faker-js/faker'
import bcrypt from 'bcryptjs'

import {test} from '../fixtures/bookpage-fixture'
import prisma from '../../src/lib/db'

test.describe('Book page data', () => {
    test.describe.configure({mode: 'serial'})

    let testBook: Book & {
        user: {
            id: string
            email: string
            password: string
            createdAt: Date
            updatedAt: Date
        } | null
    }

    test.beforeAll(async () => {
        const userId = faker.string.uuid()
        const userEmail = faker.internet.email()
        const userPassword = faker.internet.password()
        const userName = faker.person.fullName()
        const hashedPassword = await bcrypt.hash(userPassword, 10)

        const user = await prisma.user.create({
            data: {
                id: userId,
                email: userEmail,
                password: hashedPassword,
                profile: {
                    create: {
                        name: userName,
                    }
                }
            }
        })

        const bookId = faker.string.uuid()
        const bookTitle = faker.lorem.words(3)
        const bookDescription = faker.lorem.paragraph()

        testBook = await prisma.book.create({
            data: {
                id: bookId,
                title: bookTitle,
                description: bookDescription,
                userId: user.id
            },
            include: {
                user: true
            }
        })
    })

    test.afterAll(async () => {
        await prisma.book.delete({where: {id: testBook.id}})
        if (testBook.user?.email) {
            await prisma.user.delete({
                where: {email: testBook.user.email}
            })
        }
    })

    test('should display book with correct title', async ({bookPage}) => {
        await bookPage.goto(testBook.id)
        const bookTitle = await bookPage.getBookTitle()
        expect(bookTitle).toBe(testBook.title)
    })

    test('should display book with correct description', async ({bookPage}) => {
        await bookPage.goto(testBook.id)
        const bookDescription = await bookPage.getBookDescription()
        expect(bookDescription).toBe(testBook.description)
    })
})

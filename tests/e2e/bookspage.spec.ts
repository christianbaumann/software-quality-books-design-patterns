import {expect} from '@playwright/test'
import {Book} from '@prisma/client'
import {faker} from '@faker-js/faker'
import bcrypt from 'bcryptjs'

import {test} from '../fixtures/bookspage-fixture'
import {UserBuilder} from '../data-builders/user-builder'
import prisma from '../../src/lib/db'

test.describe('Books Page', () => {
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
        // Create user
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

        // Create book
        testBook = await prisma.book.create({
            data: {
                id: faker.string.uuid(),
                title: faker.lorem.words(3),
                description: faker.lorem.paragraph(),
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
            await UserBuilder.delete(testBook.user.email)
        }
    })

    test('should display created book', async ({booksPage}) => {
        await booksPage.goto()
        await expect(booksPage.getBookCard(testBook.title)).toBeVisible()
    })

    test('should display book with correct title', async ({booksPage}) => {
        await booksPage.goto()
        const bookTitle = await booksPage.getBookTitle(testBook.title)
        expect(bookTitle).toBe(testBook.title)
    })

    test('should display book with correct created date', async ({booksPage}) => {
        await booksPage.goto()
        const bookCreatedDate = await booksPage.getBookCreatedDate(testBook.title)
        const expectedDate = new Intl.DateTimeFormat('en-US').format(testBook.createdAt)
        expect(bookCreatedDate).toBe(expectedDate)
    })
})

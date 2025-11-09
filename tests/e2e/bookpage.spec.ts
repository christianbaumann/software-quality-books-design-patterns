import {test, expect} from '../fixtures/bookpage-fixture'
import {Book} from '@prisma/client'
import {UserBuilder} from '../data-builders/user-builder'
import {BookBuilder} from '../data-builders/book-builder'
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
    let testUser: Awaited<ReturnType<typeof UserBuilder.prototype.create>>

    test.beforeAll(async ({bookBuilder}) => {
        testUser = await new UserBuilder().create()
        testBook = await bookBuilder(testUser.id).create()
    })

    test.afterAll(async () => {
        await BookBuilder.delete(testBook.id)
        await UserBuilder.delete(testUser.email)
        await prisma.$disconnect()
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

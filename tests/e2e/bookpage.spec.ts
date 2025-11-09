import {expect, test} from '@playwright/test'
import {Book} from '@prisma/client'
import {UserBuilder} from '../data-builders/user-builder'
import {BookBuilder} from '../data-builders/book-builder'
import {BookPage} from '../page-objects/book-page'

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

    test.beforeAll(async () => {
        testUser = await new UserBuilder().create()
        testBook = await new BookBuilder(testUser.id).create()
    })

    test.afterAll(async () => {
        await BookBuilder.delete(testBook.id)
        await UserBuilder.delete(testUser.email)
    })

    test('should display book with correct title', async ({page}) => {
        const bookPage = new BookPage(page)
        await bookPage.goto(testBook.id)
        const bookTitle = await bookPage.getBookTitle()
        expect(bookTitle).toBe(testBook.title)
    })

    test('should display book with correct description', async ({page}) => {
        const bookPage = new BookPage(page)
        await bookPage.goto(testBook.id)
        const bookDescription = await bookPage.getBookDescription()
        expect(bookDescription).toBe(testBook.description)
    })
})

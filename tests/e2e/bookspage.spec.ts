import {test, expect} from '../fixtures/bookspage-fixture'
import {TEST_BOOK, initializeTestData} from '../fixtures/setup'

test.describe('Books Page', () => {
    test.beforeAll(async () => {
        await initializeTestData()
    })

    test('should display created book', async ({booksPage}) => {
        await booksPage.goto()
        await expect(booksPage.getBookCard(TEST_BOOK.title)).toBeVisible()
    })

    test('should display book with correct title', async ({booksPage}) => {
        await booksPage.goto()
        const bookTitle = await booksPage.getBookTitle(TEST_BOOK.title)
        expect(bookTitle).toBe(TEST_BOOK.title)
    })

    test('should display book with correct created date', async ({booksPage}) => {
        await booksPage.goto()
        const bookCreatedDate = await booksPage.getBookCreatedDate(TEST_BOOK.title)
        expect(bookCreatedDate).toBeTruthy()
    })
})

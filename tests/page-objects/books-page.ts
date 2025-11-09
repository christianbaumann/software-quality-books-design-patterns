import {Page, Locator} from '@playwright/test'
import {generateTestId, TEST_DATA_IDS} from '@/utils/idHelpers'

export class BooksPage {
    readonly page: Page

    constructor(page: Page) {
        this.page = page
    }

    async goto() {
        await this.page.goto('/books')
    }

    getBookCard(title: string): Locator {
        return this.page.getByTestId(generateTestId(TEST_DATA_IDS.BOOK_CARD, title))
    }

    async getBookTitle(title: string): Promise<string | null> {
        const bookCard = this.getBookCard(title)
        const titleElement = bookCard.locator('h2')
        return await titleElement.textContent()
    }

    async getBookDescription(title: string): Promise<string | null> {
        const bookCard = this.getBookCard(title)
        const descriptionElement = bookCard.locator('p')
        return await descriptionElement.textContent()
    }

    async getBookCreatedDate(title: string): Promise<string | null> {
        const bookCard = this.getBookCard(title)
        const dateElement = bookCard.getByTestId('date-created')
        return await dateElement.textContent()
    }
}

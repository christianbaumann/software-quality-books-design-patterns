import {Page} from '@playwright/test'

export class BookPage {
    constructor(private page: Page) {
    }

    async goto(bookId: string) {
        await this.page.goto(`/books/${bookId}`)
    }

    async getBookTitle(): Promise<string | null> {
        return await this.page.getByTestId('book-title').textContent()
    }

    async getBookDescription(): Promise<string | null> {
        return await this.page.getByTestId('book-description').textContent()
    }
}

import {Page, Locator} from '@playwright/test'

export class NewBookPage {
    readonly page: Page
    readonly titleInput: Locator
    readonly descriptionInput: Locator
    readonly submitButton: Locator

    constructor(page: Page) {
        this.page = page
        this.titleInput = page.getByLabel('Title')
        this.descriptionInput = page.getByLabel('Description')
        this.submitButton = page.getByRole('button', {name: /Add Book|Saving.../})
    }

    async goto() {
        await this.page.goto('/books/new')
    }

    async fillTitle(title: string) {
        await this.titleInput.fill(title)
    }

    async fillDescription(description: string) {
        await this.descriptionInput.fill(description)
    }

    async submitForm() {
        await this.submitButton.click()
    }

    async createBook(title: string, description: string) {
        await this.fillTitle(title)
        await this.fillDescription(description)
        await this.submitForm()
    }
}

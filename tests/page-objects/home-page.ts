import {Page, Locator} from '@playwright/test'

export class HomePage {
    readonly page: Page
    readonly signInButton: Locator
    readonly addBookButton: Locator

    constructor(page: Page) {
        this.page = page
        this.signInButton = page.getByText('Sign In')
        this.addBookButton = page.getByRole('link', {name: 'Add New Book'})
    }

    async goto() {
        await this.page.goto('/')
    }

    async clickSignIn() {
        await this.signInButton.click()
    }

    async getAddBookButton() {
        return this.addBookButton
    }
}

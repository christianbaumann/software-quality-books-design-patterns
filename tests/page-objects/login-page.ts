import { Page, Locator } from '@playwright/test'

export class LoginPage {
    readonly page: Page
    readonly signInButton: Locator
    readonly passwordField: Locator
    readonly emailField: Locator

    constructor(page: Page) {
        this.page = page
        this.signInButton = page.locator('button[type="submit"]')
        this.passwordField = page.locator('input[name="password"]')
        this.emailField = page.locator('input[name="email"]')
    }

    async goto() {
        await this.page.goto('/login')
    }

    async fillEmail(email: string) {
        await this.emailField.fill(email)
    }

    async fillPassword(password: string) {
        await this.passwordField.fill(password)
    }

    async clickSignIn() {
        await this.signInButton.click()
    }

    getValidationError(message: string) {
        return this.page.getByText(message)
    }
}

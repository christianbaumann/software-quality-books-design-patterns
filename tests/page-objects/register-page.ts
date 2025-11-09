import {Page, Locator} from '@playwright/test'

export class RegisterPage {
    readonly page: Page
    readonly emailInput: Locator
    readonly passwordInput: Locator
    readonly nameInput: Locator
    readonly submitButton: Locator

    constructor(page: Page) {
        this.page = page
        this.emailInput = page.getByLabel('Email')
        this.passwordInput = page.getByLabel('Password')
        this.nameInput = page.getByLabel('Name')
        this.submitButton = page.getByText('Create account')
    }

    async goto() {
        await this.page.goto('/register')
    }

    async fillEmail(email: string) {
        await this.emailInput.fill(email)
    }

    async fillPassword(password: string) {
        await this.passwordInput.fill(password)
    }

    async fillName(name: string) {
        await this.nameInput.fill(name)
    }

    async clickCreateAccountButton() {
        await this.submitButton.click()
    }
}

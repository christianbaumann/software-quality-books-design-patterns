import {Page} from '@playwright/test'
import {UserBuilder} from '../data-builders/user-builder'

export class AuthHelper {
    constructor(private page: Page) {
    }

    async loginUser(user?: { id: string; email: string; password: string }) {
        const testUser = user || await new UserBuilder().create()

        await this.page.context().clearCookies()

        const csrfResponse = await this.page.request.get('/api/auth/csrf')
        const {csrfToken} = await csrfResponse.json()

        const loginResponse = await this.page.request.post(
            '/api/auth/callback/credentials',
            {
                form: {
                    csrfToken,
                    email: testUser.email,
                    password: testUser.password,
                    callbackUrl: '/'
                }
            }
        )

        if (!loginResponse.ok()) {
            throw new Error(`Login failed: ${loginResponse.status()}`)
        }

        await this.page.request.get('/api/auth/session')
        await this.page.goto('/')

        return testUser
    }

    async logout() {
        await this.page.context().clearCookies()
        await this.page.goto('/')
    }
}

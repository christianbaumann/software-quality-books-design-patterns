import {Page} from '@playwright/test'
import {faker} from '@faker-js/faker'
import bcrypt from 'bcryptjs'
import prisma from '../../src/lib/db'

type BuiltUser = {
    id: string
    email: string
    password: string
    createdAt: Date
    updatedAt: Date
}

export class AuthHelper {
    private readonly page: Page

    constructor(page: Page) {
        this.page = page
    }

    async loginUser(user?: BuiltUser) {
        let testUser: BuiltUser

        if (user) {
            testUser = user
        } else {
            const userId = faker.string.uuid()
            const userEmail = faker.internet.email()
            const userPassword = faker.internet.password()
            const userName = faker.person.fullName()
            const hashedPassword = await bcrypt.hash(userPassword, 10)

            const createdUser = await prisma.user.create({
                data: {
                    id: userId,
                    email: userEmail,
                    password: hashedPassword,
                    profile: {
                        create: {
                            name: userName,
                        }
                    }
                },
                include: {
                    profile: true
                }
            })

            testUser = {
                ...createdUser,
                password: userPassword
            }
        }

        await this.page.context().clearCookies()

        const csrfResponse = await this.page.request.get('/api/auth/csrf')
        if (!csrfResponse.ok()) {
            throw new Error('Failed to retrieve CSRF token for login')
        }

        const {csrfToken} = (await csrfResponse.json()) as { csrfToken?: string }
        if (!csrfToken) {
            throw new Error('No CSRF token returned from auth endpoint')
        }

        const signInResponse = await this.page.request.post('/api/auth/callback/credentials', {
            form: {
                csrfToken,
                email: testUser.email,
                password: testUser.password,
                callbackUrl: '/'
            }
        })

        if (signInResponse.status() >= 400) {
            throw new Error(`Failed to sign in test user. Status: ${signInResponse.status()}`)
        }

        const sessionResponse = await this.page.request.get('/api/auth/session')
        if (!sessionResponse.ok()) {
            throw new Error('Failed to verify authenticated session')
        }

        const sessionData = await sessionResponse.json() as {
            user?: { id?: string; email?: string | null }
        }

        if (sessionData.user?.email !== testUser.email) {
            throw new Error('Authenticated session does not match test user')
        }

        await this.page.goto('/')

        return testUser
    }
}
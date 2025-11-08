import {expect, test} from '@playwright/test'
import {faker} from '@faker-js/faker'
import bcrypt from 'bcryptjs'

import prisma from '../../src/lib/db'

test.describe('Homepage', () => {
    test('should show add book button when user is logged in', async ({page}) => {
        const userId = faker.string.uuid()
        const userEmail = faker.internet.email()
        const userPassword = faker.internet.password()
        const userName = faker.person.fullName()
        const hashedPassword = await bcrypt.hash(userPassword, 10)

        const user = await prisma.user.create({
            data: {
                id: userId,
                email: userEmail,
                password: hashedPassword,
                profile: {
                    create: {name: userName}
                }
            }
        })

        await page.context().clearCookies()
        const csrfResponse = await page.request.get('/api/auth/csrf')
        const {csrfToken} = await csrfResponse.json()

        await page.request.post('/api/auth/callback/credentials', {
            form: {csrfToken, email: userEmail, password: userPassword, callbackUrl: '/'}
        })

        await page.request.get('/api/auth/session')
        await page.goto('/')

        const addBookButton = page.getByRole('link', {name: 'Add New Book'})
        await expect(addBookButton).toBeVisible()
    })

    test('should navigate to login page when clicking Sign In button', async ({page}) => {
        await page.goto('/')

        const signInButton = page.getByText('Sign In')
        await signInButton.waitFor({state: 'visible'})
        await signInButton.click()

        await expect(page).toHaveURL('/login')
        await expect(page.getByRole('heading', {name: 'Sign in to your account'})).toBeVisible()
        await expect(page.getByLabel('Email')).toBeVisible()
        await expect(page.getByLabel('Password')).toBeVisible()
        await expect(page.getByRole('button', {name: 'Sign In'})).toBeVisible()
    })
})

import {expect, test} from '@playwright/test'
import {UserBuilder} from '../data-builders/user-builder'

test.describe('Homepage', () => {
    test('should show add book button when user is logged in', async ({page}) => {
        // Create test user
        const testUser = await new UserBuilder().create()

        // Authenticate
        await page.context().clearCookies()
        const csrfResponse = await page.request.get('/api/auth/csrf')
        const {csrfToken} = await csrfResponse.json()

        await page.request.post('/api/auth/callback/credentials', {
            form: {csrfToken, email: testUser.email, password: testUser.password, callbackUrl: '/'}
        })

        await page.request.get('/api/auth/session')
        await page.goto('/')

        const addBookButton = page.getByRole('link', {name: 'Add New Book'})
        await expect(addBookButton).toBeVisible()

        // Cleanup
        await UserBuilder.delete(testUser.email)
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

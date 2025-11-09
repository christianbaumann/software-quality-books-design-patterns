import {expect, test} from '@playwright/test'
import {UserBuilder} from '../data-builders/user-builder'
import {HomePage} from '../page-objects/home-page'

test.describe('Homepage', () => {
    test('should show add book button when user is logged in', async ({page}) => {
        const testUser = await new UserBuilder().create()

        await page.context().clearCookies()
        const csrfResponse = await page.request.get('/api/auth/csrf')
        const {csrfToken} = await csrfResponse.json()

        await page.request.post('/api/auth/callback/credentials', {
            form: {csrfToken, email: testUser.email, password: testUser.password, callbackUrl: '/'}
        })

        await page.request.get('/api/auth/session')

        const homePage = new HomePage(page)
        await homePage.goto()

        const addBookButton = await homePage.getAddBookButton()
        await expect(addBookButton).toBeVisible()

        await UserBuilder.delete(testUser.email)
    })

    test('should navigate to login page when clicking Sign In button', async ({page}) => {
        const homePage = new HomePage(page)
        await homePage.goto()
        await homePage.clickSignIn()
        await expect(page).toHaveURL('/login')
        await expect(page.getByRole('heading', {name: 'Sign in to your account'})).toBeVisible()
        await expect(page.getByLabel('Email')).toBeVisible()
        await expect(page.getByLabel('Password')).toBeVisible()
        await expect(page.getByRole('button', {name: 'Sign In'})).toBeVisible()
    })
})

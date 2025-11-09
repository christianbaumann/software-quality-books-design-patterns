import {expect, test} from '@playwright/test'
import {UserBuilder} from '../data-builders/user-builder'
import {HomePage} from '../page-objects/home-page'
import {AuthHelper} from '../helpers/auth.helper'

test.describe('Homepage', () => {
    test('should show add book button when user is logged in', async ({page}) => {
        const authHelper = new AuthHelper(page)
        const testUser = await authHelper.loginUser()

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

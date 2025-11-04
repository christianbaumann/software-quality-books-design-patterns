import {expect} from '@playwright/test'

import {test} from '../fixtures/homepage-fixture'
import {AuthHelper} from '../helpers/auth.helper'
import prisma from '../../src/lib/db'

test.describe('Homepage', () => {
    test('should show add book button when user is logged in', async ({homePage, page}) => {
        const authHelper = new AuthHelper(page);
        const testUser = await authHelper.loginUser()

        await homePage.goto()

        const addBookButton = await homePage.getAddBookButton()
        await expect(addBookButton).toBeVisible()

        await prisma.user.delete({
            where: {email: testUser.email}
        })
    })

    test('should navigate to login page when clicking Sign In button', async ({homePage}) => {
        await homePage.goto()
        await homePage.clickSignIn()
        await expect(homePage.page).toHaveURL('/login')
        await expect(homePage.page.getByRole('heading', {name: 'Sign in to your account'})).toBeVisible()
        await expect(homePage.page.getByLabel('Email')).toBeVisible()
        await expect(homePage.page.getByLabel('Password')).toBeVisible()
        await expect(homePage.page.getByRole('button', {name: 'Sign In'})).toBeVisible()
    })
})

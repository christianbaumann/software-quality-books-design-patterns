import {test, expect} from '../fixtures/registration-fixture'
import {UserBuilder} from '../data-builders/user-builder'
import prisma from '../../src/lib/db'

test.describe('Registration', () => {
    test.afterEach(async () => {
        await prisma.$disconnect()
    })

    test('shows success notification when registering a new account', async ({registerPage, userBuilder}) => {
        const testUser = await userBuilder.build()

        await registerPage.goto()
        await registerPage.fillEmail(testUser.email)
        await registerPage.fillPassword(testUser.password)
        await registerPage.fillName(testUser.name)
        await registerPage.clickCreateAccountButton()

        await expect(registerPage.page.getByText('Account created successfully!')).toBeVisible()
        await expect(registerPage.page).toHaveURL('/login')
    })

    test('shows error when name is only 1 character', async ({registerPage, userBuilder}) => {
        const testUser = await userBuilder
            .withName('A')
            .build()

        await registerPage.goto()
        await registerPage.fillEmail(testUser.email)
        await registerPage.fillPassword(testUser.password)
        await registerPage.fillName(testUser.name)
        await registerPage.clickCreateAccountButton()

        await expect(registerPage.page.getByText('Name must be at least 2 characters')).toBeVisible()
        await expect(registerPage.page).toHaveURL('/register')
    })

    test('shows error when email format is invalid', async ({registerPage, userBuilder}) => {
        const testUser = await userBuilder
            .withEmail('not-an-email')
            .build()

        await registerPage.goto()
        await registerPage.fillEmail(testUser.email)
        await registerPage.fillPassword(testUser.password)
        await registerPage.fillName(testUser.name)
        await registerPage.clickCreateAccountButton()

        await expect(registerPage.page.getByText('Invalid email address')).toBeVisible()
        await expect(registerPage.page).toHaveURL('/register')
    })

    test('shows error when password is only 5 characters', async ({registerPage, userBuilder}) => {
        const testUser = await userBuilder
            .withPassword('12345')
            .build()

        await registerPage.goto()
        await registerPage.fillEmail(testUser.email)
        await registerPage.fillPassword(testUser.password)
        await registerPage.fillName(testUser.name)
        await registerPage.clickCreateAccountButton()

        await expect(registerPage.page.getByText('Password must be at least 8 characters')).toBeVisible()
        await expect(registerPage.page).toHaveURL('/register')
    })

    test('shows both name and email errors when password is valid', async ({registerPage, userBuilder}) => {
        const testUser = await userBuilder
            .withName('A')
            .withEmail('not-an-email')
            .build()

        await registerPage.goto()
        await registerPage.fillEmail(testUser.email)
        await registerPage.fillPassword(testUser.password)
        await registerPage.fillName(testUser.name)
        await registerPage.clickCreateAccountButton()

        await expect(registerPage.page.getByText('Name must be at least 2 characters')).toBeVisible()
        await expect(registerPage.page.getByText('Invalid email address')).toBeVisible()
        await expect(registerPage.page).toHaveURL('/register')
    })

    test('makes no API calls when validation fails', async ({registerPage, userBuilder, page}) => {
        let apiCallMade = false
        await page.route('**/api/auth/register', async route => {
            apiCallMade = true
            await route.fulfill({status: 200})
        })

        const testUser = await userBuilder
            .withName('A')
            .withEmail('not-an-email')
            .build()

        await registerPage.goto()
        await registerPage.fillEmail(testUser.email)
        await registerPage.fillPassword(testUser.password)
        await registerPage.fillName(testUser.name)
        await registerPage.clickCreateAccountButton()

        await expect(registerPage.page.getByText('Name must be at least 2 characters')).toBeVisible()
        await expect(registerPage.page.getByText('Invalid email address')).toBeVisible()

        expect(apiCallMade).toBe(false)
    })

    test('has correct login link text and path', async ({registerPage}) => {
        await registerPage.goto()

        const loginLink = registerPage.page.getByText('Already have an account? Sign in')

        await expect(loginLink).toBeVisible()
        await expect(loginLink).toHaveAttribute('href', '/login')
    })
})

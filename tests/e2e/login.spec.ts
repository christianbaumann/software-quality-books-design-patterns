import {test, expect} from '../fixtures/login-fixture'
import {UserBuilder} from '../data-builders/user-builder'

test.describe('Login Validation', () => {

    test('should show both validation messages when fields are empty', async ({loginPage}) => {
        await loginPage.goto()
        await loginPage.clickSignIn()
        await expect(loginPage.getValidationError('Invalid email address')).toBeVisible()
        await expect(loginPage.getValidationError('Password is required')).toBeVisible()
    })

    test('should show only password validation when email is filled', async ({loginPage}) => {
        await loginPage.goto()
        await loginPage.fillEmail('test@example.com')
        await loginPage.clickSignIn()
        await expect(loginPage.getValidationError('Password is required')).toBeVisible()
    })

    test('should show only email validation when password is filled', async ({loginPage}) => {
        await loginPage.goto()
        await loginPage.fillPassword('password123')
        await loginPage.clickSignIn()
        await expect(loginPage.getValidationError('Invalid email address')).toBeVisible()
    })

    test('should successfully login with valid credentials', async ({loginPage}) => {
        const testUser = await new UserBuilder().create()

        await loginPage.goto()
        await loginPage.fillEmail(testUser.email)
        await loginPage.fillPassword(testUser.password)
        await loginPage.clickSignIn()

        await expect(loginPage.page).toHaveURL('/books')

        await UserBuilder.delete(testUser.email)
    })
})

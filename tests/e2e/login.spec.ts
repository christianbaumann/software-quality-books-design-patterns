import {expect, test} from '@playwright/test'
import {UserBuilder} from '../data-builders/user-builder'

test.describe('Login Validation', () => {

    test('should show both validation messages when fields are empty', async ({page}) => {
        await page.goto('/login')
        await page.locator('button[type="submit"]').click()
        await expect(page.getByText('Invalid email address')).toBeVisible()
        await expect(page.getByText('Password is required')).toBeVisible()
    })

    test('should show only password validation when email is filled', async ({page}) => {
        await page.goto('/login')
        await page.locator('input[name="email"]').fill('test@example.com')
        await page.locator('button[type="submit"]').click()
        await expect(page.getByText('Password is required')).toBeVisible()
    })

    test('should show only email validation when password is filled', async ({page}) => {
        await page.goto('/login')
        await page.locator('input[name="password"]').fill('password123')
        await page.locator('button[type="submit"]').click()
        await expect(page.getByText('Invalid email address')).toBeVisible()
    })

    test('should successfully login with valid credentials', async ({page}) => {
        // Create test user using builder
        const testUser = await new UserBuilder().create()

        await page.goto('/login')
        await page.locator('input[name="email"]').fill(testUser.email)
        await page.locator('input[name="password"]').fill(testUser.password)
        await page.locator('button[type="submit"]').click()

        await expect(page).toHaveURL('/books')

        // Cleanup
        await UserBuilder.delete(testUser.email)
    })
})

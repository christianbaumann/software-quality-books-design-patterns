import {expect, test} from '@playwright/test'
import {UserBuilder} from '../data-builders/user-builder'
import {BookBuilder} from '../data-builders/book-builder'
import {NewBookPage} from '../page-objects/new-book-page'
import {AuthHelper} from '../helpers/auth.helper'

test.describe('New Book Validation', () => {
    let testUser: Awaited<ReturnType<UserBuilder['create']>>
    let authHelper: AuthHelper

    test.beforeEach(async ({page}) => {
        authHelper = new AuthHelper(page)
        testUser = await authHelper.loginUser()
    })

    test.afterEach(async () => {
        if (testUser?.email) {
            await UserBuilder.delete(testUser.email)
        }
    })

    test('should show error when title is empty', async ({page}) => {
        const newBookPage = new NewBookPage(page)
        await newBookPage.goto()
        await newBookPage.createBook('', 'Valid description')
        await expect(page.getByText('Title is required')).toBeVisible()
    })

    test('should show error when title exceeds 100 characters', async ({page}) => {
        const newBookPage = new NewBookPage(page)
        await newBookPage.goto()
        const longTitle = 'a'.repeat(101)
        await newBookPage.createBook(longTitle, 'Valid description')
        await expect(page.getByText('Title must be less than 100 characters')).toBeVisible()
    })

    test('should show error when description is empty', async ({page}) => {
        const newBookPage = new NewBookPage(page)
        await newBookPage.goto()
        await newBookPage.createBook('Valid title', '')
        await expect(page.getByText('Description is required')).toBeVisible()
    })

    test('should show error when description exceeds 750 characters', async ({page}) => {
        const newBookPage = new NewBookPage(page)
        await newBookPage.goto()
        const longDescription = 'a'.repeat(751)
        await newBookPage.createBook('Valid title', longDescription)
        await expect(page.getByText('Description must be less than 500 characters')).toBeVisible()
    })

    test('should show both errors when title and description are empty', async ({page}) => {
        const newBookPage = new NewBookPage(page)
        await newBookPage.goto()
        await newBookPage.createBook('', '')
        await expect(page.getByText('Title is required')).toBeVisible()
        await expect(page.getByText('Description is required')).toBeVisible()
    })

    test('should not make API call when validation fails', async ({page}) => {
        let apiCallMade = false
        await page.route('**/api/books', async route => {
            apiCallMade = true
            await route.fulfill({status: 200})
        })

        const newBookPage = new NewBookPage(page)
        await newBookPage.goto()
        await newBookPage.createBook('', '')

        await expect(page.getByText('Title is required')).toBeVisible()
        await expect(page.getByText('Description is required')).toBeVisible()

        expect(apiCallMade).toBe(false)
    })

    test('should successfully create book with valid data', async ({page}) => {
        const newBookPage = new NewBookPage(page)
        await newBookPage.goto()
        await newBookPage.createBook('Valid Title', 'Valid description that meets the minimum requirements')

        await expect(page).toHaveURL('/books')
    })
})

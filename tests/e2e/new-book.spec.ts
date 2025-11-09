import {expect, test} from '@playwright/test'
import {faker} from '@faker-js/faker'
import bcrypt from 'bcryptjs'
import prisma from '../../src/lib/db'
import {NewBookPage} from '../page-objects/new-book-page'

test.describe('New Book Validation', () => {
    let userId: string
    let userEmail: string
    let userPassword: string

    test.beforeEach(async ({page}) => {
        userId = faker.string.uuid()
        userEmail = faker.internet.email()
        userPassword = faker.internet.password()
        const userName = faker.person.fullName()
        const hashedPassword = await bcrypt.hash(userPassword, 10)

        await prisma.user.create({
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

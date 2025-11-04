import {expect, test} from '@playwright/test'
import {faker} from '@faker-js/faker'
import bcrypt from 'bcryptjs'

import {AuthHelper} from '../helpers/auth.helper'
import prisma from '../../src/lib/db'

test.describe('New Book Validation', () => {
    let testUser: {
        id: string
        email: string
        password: string
        createdAt: Date
        updatedAt: Date
    }

    test.beforeEach(async ({page}) => {
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
                    create: {
                        name: userName,
                    }
                }
            },
            include: {
                profile: true
            }
        })

        testUser = {
            ...user,
            password: userPassword
        }

        const authHelper = new AuthHelper(page)
        await authHelper.loginUser(testUser)
    })

    test.afterEach(async () => {
        if (testUser?.email) {
            await prisma.user.delete({
                where: {email: testUser.email}
            })
        }
    })

    test('should show error when title is empty', async ({page}) => {
        await page.goto('/books/new')
        await page.getByLabel('Title').fill('')
        await page.getByLabel('Description').fill('Valid description')
        await page.getByRole('button', {name: /Add Book|Saving.../}).click()
        await expect(page.getByText('Title is required')).toBeVisible()
    })

    test('should show error when title exceeds 100 characters', async ({page}) => {
        await page.goto('/books/new')
        const longTitle = 'a'.repeat(101)
        await page.getByLabel('Title').fill(longTitle)
        await page.getByLabel('Description').fill('Valid description')
        await page.getByRole('button', {name: /Add Book|Saving.../}).click()
        await expect(page.getByText('Title must be less than 100 characters')).toBeVisible()
    })

    test('should show error when description is empty', async ({page}) => {
        await page.goto('/books/new')
        await page.getByLabel('Title').fill('Valid title')
        await page.getByLabel('Description').fill('')
        await page.getByRole('button', {name: /Add Book|Saving.../}).click()
        await expect(page.getByText('Description is required')).toBeVisible()
    })

    test('should show error when description exceeds 750 characters', async ({page}) => {
        await page.goto('/books/new')
        const longDescription = 'a'.repeat(751)
        await page.getByLabel('Title').fill('Valid title')
        await page.getByLabel('Description').fill(longDescription)
        await page.getByRole('button', {name: /Add Book|Saving.../}).click()
        await expect(page.getByText('Description must be less than 500 characters')).toBeVisible()
    })

    test('should show both errors when title and description are empty', async ({page}) => {
        await page.goto('/books/new')
        await page.getByLabel('Title').fill('')
        await page.getByLabel('Description').fill('')
        await page.getByRole('button', {name: /Add Book|Saving.../}).click()
        await expect(page.getByText('Title is required')).toBeVisible()
        await expect(page.getByText('Description is required')).toBeVisible()
    })

    test('should not make API call when validation fails', async ({page}) => {
        let apiCallMade = false
        await page.route('**/api/books', async route => {
            apiCallMade = true
            await route.fulfill({status: 200})
        })

        await page.goto('/books/new')
        await page.getByLabel('Title').fill('')
        await page.getByLabel('Description').fill('')
        await page.getByRole('button', {name: /Add Book|Saving.../}).click()

        await expect(page.getByText('Title is required')).toBeVisible()
        await expect(page.getByText('Description is required')).toBeVisible()

        expect(apiCallMade).toBe(false)
    })

    test('should successfully create book with valid data', async ({page}) => {
        await page.goto('/books/new')
        await page.getByLabel('Title').fill('Valid Title')
        await page.getByLabel('Description').fill('Valid description that meets the minimum requirements')
        await page.getByRole('button', {name: /Add Book|Saving.../}).click()

        await expect(page).toHaveURL('/books')
    })
})

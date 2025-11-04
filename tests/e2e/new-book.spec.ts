import {expect} from '@playwright/test'
import {faker} from '@faker-js/faker'
import bcrypt from 'bcryptjs'

import {test} from '../fixtures/new-book-fixture'
import prisma from '../../src/lib/db'

test.describe('New Book Validation', () => {
    let testUser: {
        id: string
        email: string
        password: string
        createdAt: Date
        updatedAt: Date
    }

    test.beforeEach(async ({authHelper}) => {
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

        await authHelper.loginUser(testUser)
    })

    test.afterEach(async () => {
        if (testUser?.email) {
            await prisma.user.delete({
                where: {email: testUser.email}
            })
        }
    })

    test('should show error when title is empty', async ({newBookPage}) => {
        await newBookPage.goto()
        await newBookPage.createBook('', 'Valid description')
        await expect(newBookPage.page.getByText('Title is required')).toBeVisible()
    })

    test('should show error when title exceeds 100 characters', async ({newBookPage}) => {
        await newBookPage.goto()
        const longTitle = 'a'.repeat(101)
        await newBookPage.createBook(longTitle, 'Valid description')
        await expect(newBookPage.page.getByText('Title must be less than 100 characters')).toBeVisible()
    })

    test('should show error when description is empty', async ({newBookPage}) => {
        await newBookPage.goto()
        await newBookPage.createBook('Valid title', '')
        await expect(newBookPage.page.getByText('Description is required')).toBeVisible()
    })

    test('should show error when description exceeds 750 characters', async ({newBookPage}) => {
        await newBookPage.goto()
        const longDescription = 'a'.repeat(751)
        await newBookPage.createBook('Valid title', longDescription)
        await expect(newBookPage.page.getByText('Description must be less than 500 characters')).toBeVisible()
    })

    test('should show both errors when title and description are empty', async ({newBookPage}) => {
        await newBookPage.goto()
        await newBookPage.createBook('', '')
        await expect(newBookPage.page.getByText('Title is required')).toBeVisible()
        await expect(newBookPage.page.getByText('Description is required')).toBeVisible()
    })

    test('should not make API call when validation fails', async ({newBookPage, page}) => {
        let apiCallMade = false
        await page.route('**/api/books', async route => {
            apiCallMade = true
            await route.fulfill({status: 200})
        })

        await newBookPage.goto()
        await newBookPage.createBook('', '')

        await expect(newBookPage.page.getByText('Title is required')).toBeVisible()
        await expect(newBookPage.page.getByText('Description is required')).toBeVisible()

        expect(apiCallMade).toBe(false)
    })

    test('should successfully create book with valid data', async ({newBookPage}) => {
        await newBookPage.goto()
        await newBookPage.createBook('Valid Title', 'Valid description that meets the minimum requirements')

        await expect(newBookPage.page).toHaveURL('/books')
    })
})

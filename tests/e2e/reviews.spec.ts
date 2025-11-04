import {expect} from '@playwright/test'
import {Book} from '@prisma/client'
import {faker} from '@faker-js/faker'
import bcrypt from 'bcryptjs'

import {test} from '../fixtures/review-fixture'
import {UserBuilder} from '../data-builders/user-builder'
import prisma from '../../src/lib/db'

test.describe('Book Reviews', () => {
    test.describe.configure({mode: 'serial'})

    let testBook: Book & {
        user: {
            id: string
            email: string
            password: string
            createdAt: Date
            updatedAt: Date
        } | null
    }

    test.beforeAll(async () => {
        // Create user for book ownership
        const ownerId = faker.string.uuid()
        const ownerEmail = faker.internet.email()
        const ownerPassword = faker.internet.password()
        const ownerName = faker.person.fullName()
        const hashedOwnerPassword = await bcrypt.hash(ownerPassword, 10)

        const owner = await prisma.user.create({
            data: {
                id: ownerId,
                email: ownerEmail,
                password: hashedOwnerPassword,
                profile: {
                    create: {
                        name: ownerName,
                    }
                }
            }
        })

        // Create book
        testBook = await prisma.book.create({
            data: {
                id: faker.string.uuid(),
                title: faker.lorem.words(3),
                description: faker.lorem.paragraph(),
                userId: owner.id
            },
            include: {
                user: true
            }
        })
    })

    test.afterAll(async () => {
        await prisma.book.delete({where: {id: testBook.id}})
        if (testBook.user?.email) {
            await UserBuilder.delete(testBook.user.email)
        }
    })

    test('should show review form when user is logged in', async ({reviewPage, authHelper}) => {
        await authHelper.loginUser()
        await reviewPage.goto(testBook.id)
        await expect(reviewPage.reviewForm).toBeVisible()
    })

    test('should not show review form when user is not logged in', async ({reviewPage}) => {
        await reviewPage.goto(testBook.id)
        await expect(reviewPage.reviewForm).not.toBeVisible()
        await expect(reviewPage.page.getByText('Sign in to leave a review')).toBeVisible()
    })

    test('should show validation error when submitting empty review', async ({reviewPage, authHelper}) => {
        await authHelper.loginUser()
        await reviewPage.goto(testBook.id)
        await reviewPage.submitReview('', 0)
        await expect(reviewPage.page.getByText('Review content is required')).toBeVisible()
        await expect(reviewPage.page.getByText('Rating is required')).toBeVisible()
    })

    test('should successfully submit review', async ({reviewPage, authHelper}) => {
        const testUser = await authHelper.loginUser()
        await reviewPage.goto(testBook.id)

        const reviewContent = 'This is a test review'
        const rating = 4

        await reviewPage.submitReview(reviewContent, rating)

        // Cleanup
        await UserBuilder.delete(testUser.email)
    })

    test('should hide review form after submitting a review', async ({reviewPage, authHelper}) => {
        const testUser = await authHelper.loginUser()
        await reviewPage.goto(testBook.id)

        // Submit a review
        await reviewPage.submitReview('Test review content', 4)
        await reviewPage.page.waitForLoadState('networkidle')

        // Verify review form is hidden
        await expect(reviewPage.reviewForm).not.toBeVisible()
        await expect(reviewPage.page.getByText('You have already reviewed this book')).toBeVisible()

        // Cleanup
        await UserBuilder.delete(testUser.email)
    })

    test('should show already reviewed message when revisiting page', async ({reviewPage, authHelper}) => {
        const testUser = await authHelper.loginUser()
        await reviewPage.goto(testBook.id)

        // Submit initial review
        await reviewPage.submitReview('Test review content', 4)
        await reviewPage.page.waitForLoadState('networkidle')

        // Reload page to simulate revisiting later
        await reviewPage.page.reload({waitUntil: 'networkidle'})

        // Verify review form is still hidden
        await expect(reviewPage.reviewForm).not.toBeVisible()
        await expect(reviewPage.page.getByText('You have already reviewed this book')).toBeVisible()

        // Cleanup
        await UserBuilder.delete(testUser.email)
    })
})

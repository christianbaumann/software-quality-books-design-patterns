import {test, expect} from '../fixtures/review-fixture'
import {UserBuilder} from '../data-builders/user-builder'
import {TEST_BOOK, initializeTestData} from '../fixtures/setup'
import prisma from '../../src/lib/db'

test.describe('Book Reviews', () => {
    test.beforeAll(async () => {
        await initializeTestData()
    })

    test.afterAll(async () => {
        await prisma.$disconnect()
    })

    test('should show review form when user is logged in', async ({reviewPage, authHelper}) => {
        await authHelper.loginUser()

        await reviewPage.goto(TEST_BOOK.id)
        await expect(reviewPage.reviewForm).toBeVisible()
    })

    test('should not show review form when user is not logged in', async ({reviewPage}) => {
        await reviewPage.goto(TEST_BOOK.id)
        await expect(reviewPage.reviewForm).not.toBeVisible()
        await expect(reviewPage.page.getByText('Sign in to leave a review')).toBeVisible()
    })

    test('should show validation error when submitting empty review', async ({reviewPage, authHelper}) => {
        await authHelper.loginUser()

        await reviewPage.goto(TEST_BOOK.id)
        await reviewPage.submitReview('', 0)
        await expect(reviewPage.page.getByText('Review content is required')).toBeVisible()
        await expect(reviewPage.page.getByText('Rating is required')).toBeVisible()
    })

    test('should successfully submit review', async ({reviewPage, authHelper}) => {
        const testUser = await authHelper.loginUser()

        await reviewPage.goto(TEST_BOOK.id)

        const reviewContent = 'This is a test review'
        const rating = 4

        await reviewPage.submitReview(reviewContent, rating)

        await UserBuilder.delete(testUser.email)
    })

    test('should hide review form after submitting a review', async ({reviewPage, authHelper}) => {
        const testUser = await authHelper.loginUser()

        await reviewPage.goto(TEST_BOOK.id)

        await reviewPage.submitReview('Test review content', 4)

        await reviewPage.page.waitForLoadState('networkidle')

        await expect(reviewPage.reviewForm).not.toBeVisible()
        await expect(reviewPage.page.getByText('You have already reviewed this book')).toBeVisible()

        await UserBuilder.delete(testUser.email)
    })

    test('should show already reviewed message when revisiting page', async ({reviewPage, authHelper}) => {
        const testUser = await authHelper.loginUser()

        await reviewPage.goto(TEST_BOOK.id)

        await reviewPage.submitReview('Test review content', 4)

        await reviewPage.page.waitForLoadState('networkidle')

        await reviewPage.goto(TEST_BOOK.id)
        await reviewPage.page.waitForLoadState('networkidle')

        await expect(reviewPage.reviewForm).not.toBeVisible()
        await expect(reviewPage.page.getByText('You have already reviewed this book')).toBeVisible()

        await UserBuilder.delete(testUser.email)
    })
})

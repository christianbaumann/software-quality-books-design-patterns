import {test as base} from '@playwright/test'
import {ReviewPage} from '../page-objects/review-page'
import {AuthHelper} from '../helpers/auth.helper'
import {BookBuilder} from '../data-builders/book-builder'

type ReviewFixtures = {
    reviewPage: ReviewPage
    authHelper: AuthHelper
    bookBuilder: (userId: string) => BookBuilder
}

export const test = base.extend<ReviewFixtures>({
    reviewPage: async ({page}, use) => {
        await use(new ReviewPage(page))
    },
    authHelper: async ({page}, use) => {
        await use(new AuthHelper(page))
    },
    bookBuilder: async ({}, use) => {
        await use((userId: string) => new BookBuilder(userId))
    }
})

export {expect} from '@playwright/test'

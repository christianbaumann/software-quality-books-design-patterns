import {test as base} from '@playwright/test'

import {ReviewPage} from '../page-objects/review-page'
import {AuthHelper} from '../helpers/auth.helper'

type ReviewFixtures = {
    reviewPage: ReviewPage
    authHelper: AuthHelper
}

export const test = base.extend<ReviewFixtures>({
    reviewPage: async ({page}, use) => {
        await use(new ReviewPage(page))
    },
    authHelper: async ({page}, use) => {
        await use(new AuthHelper(page))
    }
})

export {expect} from '@playwright/test'

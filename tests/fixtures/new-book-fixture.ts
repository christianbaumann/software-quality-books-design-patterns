import {test as base} from '@playwright/test'

import {NewBookPage} from '../page-objects/new-book-page'
import {AuthHelper} from '../helpers/auth.helper'

type NewBookFixtures = {
    newBookPage: NewBookPage
    authHelper: AuthHelper
}

export const test = base.extend<NewBookFixtures>({
    newBookPage: async ({page}, use) => {
        await use(new NewBookPage(page))
    },
    authHelper: async ({page}, use) => {
        await use(new AuthHelper(page))
    }
})

export {expect} from '@playwright/test'

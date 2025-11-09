import {test as base} from '@playwright/test'
import {LoginPage} from '../page-objects/login-page'

type LoginFixtures = {
    loginPage: LoginPage
}

export const test = base.extend<LoginFixtures>({
    loginPage: async ({page}, use) => {
        await use(new LoginPage(page))
    }
})

export {expect} from '@playwright/test'

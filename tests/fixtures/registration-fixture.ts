import {test as base} from '@playwright/test'

import {RegisterPage} from '../page-objects/register-page'
import {RegistrationHelper} from '../helpers/registration.helper'

type Pages = {
    registerPage: RegisterPage
}

export type TestFixtures = {
    registrationHelper: RegistrationHelper;
};

export const test = base.extend<Pages & TestFixtures>({
    registerPage: async ({page}, use) => {
        await use(new RegisterPage(page))
    },
    registrationHelper: async ({registerPage}, use) => {
        await use(new RegistrationHelper(registerPage))
    }
})

export {expect} from '@playwright/test'

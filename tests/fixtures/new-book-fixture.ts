import {test as base} from '@playwright/test'
import {RegisterPage} from '../page-objects/register-page'
import {UserBuilder} from '../data-builders/user-builder'

type RegistrationFixtures = {
    registerPage: RegisterPage
    userBuilder: UserBuilder
}

export const test = base.extend<RegistrationFixtures>({
    registerPage: async ({page}, use) => {
        await use(new RegisterPage(page))
    },
    userBuilder: async ({}, use) => {
        await use(new UserBuilder())
    }
})

export {expect} from '@playwright/test'

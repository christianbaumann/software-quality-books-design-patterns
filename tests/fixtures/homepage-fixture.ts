import {test as base} from '@playwright/test'
import {HomePage} from '../page-objects/home-page'

type HomePageFixtures = {
    homePage: HomePage
}

export const test = base.extend<HomePageFixtures>({
    homePage: async ({page}, use) => {
        await use(new HomePage(page))
    }
})

export {expect} from '@playwright/test'

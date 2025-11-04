import {test as base} from '@playwright/test'

import {BookPage} from '../page-objects/book-page'

type BookPageFixtures = {
    bookPage: BookPage
}

export const test = base.extend<BookPageFixtures>({
    bookPage: async ({page}, use) => {
        await use(new BookPage(page))
    }
})

export {expect} from '@playwright/test'

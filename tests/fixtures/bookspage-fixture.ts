import {test as base} from '@playwright/test'

import {BooksPage} from '../page-objects/books-page'

export type TestFixtures = {
    booksPage: BooksPage;
}

export const test = base.extend<TestFixtures>({
    booksPage: async ({page}, use) => {
        await use(new BooksPage(page))
    }
})

export {expect} from '@playwright/test'

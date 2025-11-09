import {test as base} from '@playwright/test'
import {BooksPage} from '../page-objects/books-page'

type BooksPageFixtures = {
    booksPage: BooksPage
}

export const test = base.extend<BooksPageFixtures>({
    booksPage: async ({page}, use) => {
        await use(new BooksPage(page))
    }
})

export {expect} from '@playwright/test'

import {test as base} from '@playwright/test'
import {BookPage} from '../page-objects/book-page'
import {BookBuilder} from '../data-builders/book-builder'

type BookPageFixtures = {
    bookPage: BookPage
    bookBuilder: (userId: string) => BookBuilder
}

export const test = base.extend<BookPageFixtures>({
    bookPage: async ({page}, use) => {
        await use(new BookPage(page))
    },
    bookBuilder: async ({}, use) => {
        await use((userId: string) => new BookBuilder(userId))
    }
})

export {expect} from '@playwright/test'

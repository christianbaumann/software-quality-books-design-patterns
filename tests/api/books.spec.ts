import {test, expect} from '@playwright/test'

import {UserBuilder} from '../data-builders/user-builder'

import {ApiHelper} from './api-helper'

test.describe('Books API', () => {
    let api: ApiHelper

    test.beforeEach(async ({request}) => {
        api = new ApiHelper(request)
    })

    test('should create a new book when authenticated', async () => {
        // Create and authenticate user
        const testUser = await api.createAuthenticatedUser()

        const newBook = {
            title: 'Test Book Title',
            description: 'Test book description'
        }

        // Create book
        const response = await api.createBook(newBook)

        expect(response.ok()).toBeTruthy()
        const addedBook = await response.json()
        expect(addedBook.title).toBe(newBook.title)
        expect(addedBook.description).toBe(newBook.description)

        // Cleanup
        await UserBuilder.delete(testUser.email)
    })

    test('should return 401 when creating book without auth', async () => {
        const response = await api.createBook({
            title: 'Test Book',
            description: 'Test Description'
        })

        expect(response.status()).toBe(401)
        const error = await response.json()
        expect(error.error).toBe('Unauthorized')
    })
})

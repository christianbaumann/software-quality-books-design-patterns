import {test, expect} from '@playwright/test'
import {UserBuilder} from '../data-builders/user-builder'
import {BookBuilder} from '../data-builders/book-builder'

test.describe('Books API', () => {
    test('should create a new book when authenticated', async ({request}) => {
        const testUser = await new UserBuilder().create()

        const csrfResponse = await request.get('/api/auth/csrf')
        const {csrfToken} = await csrfResponse.json()

        const loginResponse = await request.post('/api/auth/callback/credentials', {
            form: {
                email: testUser.email,
                password: testUser.password,
                csrfToken,
                redirect: 'false',
                callbackUrl: 'http://localhost:3000/login',
                json: 'true'
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })

        if (!loginResponse.ok()) {
            throw new Error('Authentication failed')
        }

        await request.get('/api/auth/session')

        const newBook = {
            title: 'Test Book Title',
            description: 'Test book description'
        }

        const response = await request.post('/api/books', {
            data: newBook,
            headers: {
                'Content-Type': 'application/json'
            }
        })

        expect(response.ok()).toBeTruthy()
        const addedBook = await response.json()
        expect(addedBook.title).toBe(newBook.title)
        expect(addedBook.description).toBe(newBook.description)

        await UserBuilder.delete(testUser.email)
    })

    test('should return 401 when creating book without auth', async ({request}) => {
        const response = await request.post('/api/books', {
            data: {
                title: 'Test Book',
                description: 'Test Description'
            },
            headers: {
                'Content-Type': 'application/json'
            }
        })

        expect(response.status()).toBe(401)
        const error = await response.json()
        expect(error.error).toBe('Unauthorized')
    })
})

import {test, expect} from '@playwright/test'
import {faker} from '@faker-js/faker'
import bcrypt from 'bcryptjs'

import prisma from '../../src/lib/db'

test.describe('Books API', () => {
    test('should create a new book when authenticated', async ({request}) => {
        const userId = faker.string.uuid()
        const userEmail = faker.internet.email()
        const userPassword = faker.internet.password()
        const userName = faker.person.fullName()
        const hashedPassword = await bcrypt.hash(userPassword, 10)

        const user = await prisma.user.create({
            data: {
                id: userId,
                email: userEmail,
                password: hashedPassword,
                profile: {
                    create: {
                        name: userName,
                    }
                }
            },
            include: {
                profile: true
            }
        })

        const csrfResponse = await request.get('/api/auth/csrf')
        const {csrfToken} = await csrfResponse.json()

        const loginResponse = await request.post('/api/auth/callback/credentials', {
            form: {
                email: userEmail,
                password: userPassword,
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

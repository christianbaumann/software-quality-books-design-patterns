import {APIRequestContext} from '@playwright/test';
import {faker} from '@faker-js/faker'
import bcrypt from 'bcryptjs'
import prisma from '../../src/lib/db'

export class ApiHelper {
    private readonly request: APIRequestContext

    constructor(request: APIRequestContext) {
        this.request = request
    }

    private async getCsrfToken() {
        const response = await this.request.get('/api/auth/csrf');
        const {csrfToken} = await response.json();
        return csrfToken;
    }

    async login(credentials: { email: string; password: string }) {
        const csrfToken = await this.getCsrfToken();

        const response = await this.request.post('/api/auth/callback/credentials', {
            form: {
                ...credentials,
                csrfToken,
                redirect: 'false',
                callbackUrl: 'http://localhost:3000/login',
                json: 'true'
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (!response.ok()) {
            throw new Error('Authentication failed');
        }

        await this.request.get('/api/auth/session');
    }

    async createAuthenticatedUser() {
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

        await this.login({
            email: userEmail,
            password: userPassword
        });

        return {
            ...user,
            password: userPassword
        };
    }

    async createBook(bookData: { title: string; description: string }) {
        return this.request.post('/api/books', {
            data: bookData,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    async getBooks() {
        return this.request.get('/api/books');
    }
}

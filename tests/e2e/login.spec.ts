import {expect} from '@playwright/test'
import {faker} from '@faker-js/faker'
import bcrypt from 'bcryptjs'

import {test} from '../fixtures/login-fixture'
import prisma from '../../src/lib/db'

test.describe('Login Validation', () => {

    test('should show both validation messages when fields are empty', async ({loginPage}) => {
        await loginPage.goto()
        await loginPage.clickSignIn()
        await expect(loginPage.page.getByText('Invalid email address')).toBeVisible()
        await expect(loginPage.page.getByText('Password is required')).toBeVisible()
    })

    test('should show only password validation when email is filled', async ({loginPage}) => {
        await loginPage.goto()
        await loginPage.fillEmail('test@example.com')
        await loginPage.clickSignIn()
        await expect(loginPage.page.getByText('Password is required')).toBeVisible()
    })

    test('should show only email validation when password is filled', async ({loginPage}) => {
        await loginPage.goto()
        await loginPage.fillPassword('password123')
        await loginPage.clickSignIn()
        await expect(loginPage.page.getByText('Invalid email address')).toBeVisible()
    })

    test('should successfully login with valid credentials', async ({loginPage}) => {
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

        const testUser = {
            ...user,
            password: userPassword
        }

        await loginPage.goto();
        await loginPage.fillEmail(testUser.email);
        await loginPage.fillPassword(testUser.password);
        await loginPage.clickSignIn();

        await expect(loginPage.page).toHaveURL('/books');

        await prisma.user.delete({
            where: {email: testUser.email}
        });
    })
})

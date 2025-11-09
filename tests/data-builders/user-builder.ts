import {faker} from '@faker-js/faker'
import bcrypt from 'bcryptjs'
import prisma from '../../src/lib/db'

type UserData = {
    id: string
    email: string
    password: string
    name: string
}

export class UserBuilder {
    private data: UserData

    constructor() {
        this.data = {
            id: faker.string.uuid(),
            email: faker.internet.email(),
            password: faker.internet.password(),
            name: faker.person.fullName()
        }
    }

    // Fluent interface
    withEmail(email: string): this {
        this.data.email = email
        return this
    }

    withPassword(password: string): this {
        this.data.password = password
        return this
    }

    withName(name: string): this {
        this.data.name = name
        return this
    }

    // Build without persisting
    build(): UserData {
        return {...this.data}
    }

    // Build + persist to DB
    async create() {
        const hashedPassword = await bcrypt.hash(this.data.password, 10)
        const rawPassword = this.data.password

        const user = await prisma.user.create({
            data: {
                id: this.data.id,
                email: this.data.email,
                password: hashedPassword,
                profile: {create: {name: this.data.name}}
            },
            include: {profile: true}
        })

        // Return with plain password for login tests
        return {...user, password: rawPassword}
    }

    // Cleanup utility
    static async delete(email: string) {
        await prisma.user.delete({where: {email}})
    }
}

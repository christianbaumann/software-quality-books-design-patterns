import {faker} from '@faker-js/faker'
import prisma from '../../src/lib/db'

export class BookBuilder {
    private data: {
        id: string
        title: string
        description: string
        userId: string
    }

    constructor(userId: string) {
        this.data = {
            id: faker.string.uuid(),
            title: faker.lorem.words(3),
            description: faker.lorem.paragraph(),
            userId
        }
    }

    withTitle(title: string): this {
        this.data.title = title
        return this
    }

    withDescription(description: string): this {
        this.data.description = description
        return this
    }

    build() {
        return {...this.data}
    }

    async create() {
        return await prisma.book.create({
            data: this.data,
            include: {user: true}
        })
    }

    static async delete(id: string) {
        await prisma.book.delete({where: {id}})
    }
}

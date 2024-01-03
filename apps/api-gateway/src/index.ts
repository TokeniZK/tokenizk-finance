import { FastifyCore } from './app'
import { initORM } from './lib/orm'

const server = async () => {
    await initORM()
    const app = new FastifyCore()
    await app.listen()
}

export default server

server()

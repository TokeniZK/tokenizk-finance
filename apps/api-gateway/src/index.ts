import { activeMinaInstance } from '@tokenizk/util';
import { FastifyCore } from './app'
import { initORM } from './lib/orm'

await activeMinaInstance();

const server = async () => {
    await initORM()
    const app = new FastifyCore()
    await app.listen()
}

export default server

server()

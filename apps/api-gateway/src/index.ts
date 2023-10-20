import { FastifyCore } from './app'
import { initORM } from './lib/orm'

const server = async () => {
    await initORM()
  try {
       const app = new FastifyCore()
    } catch (error) {
      console.log(error)
    }
    await app.listen()
}

export default server

server()

import { FastifyPlugin } from "fastify"
import { queryCommentsByAddr } from './query-comments-by-address'
import { queryNewCommentsByUserAddr } from './query-new-comments-by-user-address'
import { submitComment } from './submit-comment'

export const commentsEndpoint: FastifyPlugin = async (
  instance,
  options,
  done
): Promise<void> => {
  instance.register(queryCommentsByAddr);
  instance.register(queryNewCommentsByUserAddr);
  instance.register(submitComment);
}

import { FastifyPlugin } from "fastify"
import { querySaleList } from './query-sale'
import { querySaleListByUser } from './query-sale-by-user'

import { querySaleDetails } from './query-sale-details'

import { contributeSale } from './submit-contribution'
import { createSale } from './submit-sale'

export const saleEndpoint: FastifyPlugin = async (
  instance,
  options,
  done
): Promise<void> => {
  instance.register(querySaleList);
  instance.register(querySaleListByUser);
  instance.register(querySaleDetails);
  instance.register(contributeSale);
  instance.register(createSale);
}

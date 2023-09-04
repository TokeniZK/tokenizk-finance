import config from '../config';
import axios from 'axios';

export const $axiosCoreService = axios.create({
    baseURL: `${config.httpProtocol}://${config.coreServiceHost}:${config.coreServicePort}`,
    withCredentials: true,
});

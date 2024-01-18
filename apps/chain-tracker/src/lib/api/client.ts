import config from '../config';
import axios from 'axios';

export const $axiosCore = axios.create({
    baseURL: `${config.httpProtocol}://${config.coreServiceHost}:${config.coreServicePort}`,
    withCredentials: true,
});



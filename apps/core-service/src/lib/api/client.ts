import config from '../config';
import axios from 'axios';

export const $axiosCoordinator = axios.create({
    baseURL: `${config.httpProtocol}://${config.coordinatorHost}:${config.coordinatorPort}`,
    withCredentials: true,
});

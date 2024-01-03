import config from '../config';
import axios from 'axios';

export const $axiosCore = axios.create({
    baseURL: `${config.httpProtocol}://${config.sequencerHost}:${config.sequencerPort}`,
    withCredentials: true,
});

export const $axiosDeposit = axios.create({
    baseURL: `${config.httpProtocol}://${config.depositProcessorHost}:${config.depositProcessorPort}`,
    withCredentials: true,
});


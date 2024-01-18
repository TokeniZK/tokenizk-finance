import config from '../config';
import axios from 'axios';

export const $axiosProofGenerator = axios.create({
    baseURL: `${config.httpProtocol}://${config.proofGenHost}:${config.proofGenPort}`,
    withCredentials: true,
});

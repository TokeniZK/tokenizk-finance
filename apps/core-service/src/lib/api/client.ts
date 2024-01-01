import config from '../config';
import axios from 'axios';

export const $axiosProofGenerator = axios.create({
    baseURL: `${config.httpProtocol}://${config.proofGeneratorHost}:${config.proofGeneratorPort}`,
    withCredentials: true,
});

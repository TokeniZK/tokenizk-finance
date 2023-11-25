import type { AxiosError } from 'axios';

export interface ResponseError extends AxiosError {
    isNetworkError: boolean;
    timeout: boolean;// add timeout flag to check if timeout error
}

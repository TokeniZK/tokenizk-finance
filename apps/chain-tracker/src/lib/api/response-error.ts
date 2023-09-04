import type { AxiosError } from 'axios';

export interface ResponseError extends AxiosError {
    isNetworkError: boolean;
}

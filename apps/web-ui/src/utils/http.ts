// axios 基础的封装
import axios, { AxiosError, type AxiosResponse } from "axios";

// 创建 axios 实例
export const $httpInstance = axios.create({
  baseURL: 'http://pcapi-xiaotuxian-front-devtest.itheima.net',
  timeout: 5000
})

type ResponseSuccessCallback = (response: AxiosResponse) => void;
type ResponseErrorCallback = (error: ResponseError) => void;

interface CallbackTrigger {
  responseSuccess: ResponseSuccessCallback;
  responseError: ResponseErrorCallback;
}

export interface ResponseError extends AxiosError {
  isNetworkError: boolean;
}

const callbackTrigger: CallbackTrigger = {
  responseSuccess: (null as any) as ResponseSuccessCallback,
  responseError: (null as any) as ResponseErrorCallback
};

$httpInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    if (callbackTrigger.responseSuccess) callbackTrigger.responseSuccess(response);
    return response;
  },

  async (error: ResponseError) => {
    if (error.response && error.response.status !== 0) {
      error.isNetworkError = false;
    } else {
      error.isNetworkError = true;
    }

    if (callbackTrigger.responseError) {
      callbackTrigger.responseError(error);
    }
    return Promise.reject(error);
  }
);
export function onResponseSuccess(callback: ResponseSuccessCallback): void {
  callbackTrigger.responseSuccess = callback;
}

export function onResponseError(callback: ResponseErrorCallback): void {
  callbackTrigger.responseError = callback;
}


export default $httpInstance

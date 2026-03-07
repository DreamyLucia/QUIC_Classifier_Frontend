import axios, { type AxiosInstance, type AxiosResponse, HttpStatusCode } from 'axios'
import qs from 'qs'
import Cookies from 'js-cookie';
import { message } from 'ant-design-vue'

const basePath = import.meta.env.VITE_PUBLIC_BASE || '/';

// Create a new Axios instance
const api: AxiosInstance = axios.create({
  // 统一前缀
  baseURL: ``,
  timeout: 5000, // 全局超时时间
  paramsSerializer: {
    serialize: (params: any) => {
      return qs.stringify(params, { arrayFormat: 'repeat' })
    },
  },
})

// 请求拦截器：自动添加 Token
api.interceptors.request.use((config) => {
  const token = import.meta.env.VITE_API_TOKEN; // 从环境变量读取
  if (token)
    config.headers.Authorization = `Bearer ${token}`;

  return config;
});

/**
 * 正常返回时的响应拦截器处理函数
 * @param response 响应结果
 * @returns 如果响应成功，则返回响应的data属性；否则，抛出错误或者执行其他操作
 */
const handleResponse = (response: AxiosResponse<any>) => {
  // 统一处理返回结果，一般判断否是成功
  // 正确时HTTP status 已经是200了，只需要自己判断业务返回值是否有异常
  const status = Number(response.data.code)
  // 如果status不存在，那么不处理，直接返回，因为有的请求没有code只要返回就认为正确;如果status存在，那么继续判断
  if (Number.isNaN(status))
    return response.data

  // 2xx表示成功，直接返回
  if (status >= 200 && status < 300)
    return response.data

  // 401表示未授权，需要重新登录
  if (status === HttpStatusCode.Unauthorized) {
    // 如果本身就在登录页面，那么不进行跳转
    if (window.location.pathname !== `${basePath}signin`)
      window.location.href = `${basePath}signin`
  }

  // 如果是 403 那么就是权限不足
  if (status === HttpStatusCode.Forbidden) {
    message.error(`权限不足:${response.data.message}`)
    throw response.data
  }

  // 301 权限不足提示
  if (status === HttpStatusCode.MovedPermanently) {
    message.error(`权限不足:${response.data.message}`)
    throw response.data
  }

  // 处理其他异常
  if (status !== 1 && status !== 0)
    throw response.data

  return response.data
}

/**
 * 错误返回时的响应拦截器处理函数
 * @param error 错误对象
 * @returns 如果错误是AxiosError，则返回错误对象；否则，抛出错误
 */
const handleError = (error: any) => {
  // 处理已经错误的，包含HTTP本身异常的以及上一步给出的业务异常
  if (!error.response)
    return Promise.reject(error)

  const status = Number(error.response.status || 500)
  // 如果HTTP的状态码不存在，那么直接返回错误(这种就是网络错误或者业务错误，所以直接继续抛出即可)
  if (Number.isNaN(status))
    return Promise.reject(error)

  // 如果是 2xx 那么就是业务错误
  if (status >= 200 && status < 300)
    return Promise.reject(error.response.data)

  // 如果是 401 那么就是未授权，需要重新登录
  if (status === HttpStatusCode.Unauthorized) {
    // 如果本身就在登录页面，那么不进行跳转
    if (window.location.pathname !== `${basePath}signin`)
      window.location.href = `${basePath}signin`
  }

  // 如果是 403 那么就是权限不足
  if (status === HttpStatusCode.Forbidden) {
    message.error(`权限不足:${error.response.data.message}`)
    throw error.response.data
  }

  // 301 权限不足提示
  if (status === HttpStatusCode.MovedPermanently) {
    message.error(`权限不足:${error.response.data.message}`)
    throw error.response.data
  }

  // 处理其他异常
  return Promise.reject(error)
}

export { api }

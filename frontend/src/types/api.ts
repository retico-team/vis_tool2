import type { AxiosRequestConfig } from 'axios';

interface ApiConfig extends AxiosRequestConfig {
  timeout?: number;
}
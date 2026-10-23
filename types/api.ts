export interface ApiFetchOptions extends RequestInit {
  next?: NextFetchRequestConfig;
  retries?: number;
}

import { AxiosRequestConfig } from 'axios';
import { APIQueryParams } from './types';

/**
 * Axios config, customisable
 */
export const axiosConfig: Omit<
	AxiosRequestConfig,
	'headers' | 'responseType' | 'url' | 'method' | 'data'
> = {
	// Empty by default. Add properties
};

interface AxiosCallbacks {
	onStart?: (url: string, params: APIQueryParams) => void;
	onSuccess?: (url: string, params: APIQueryParams) => void;
	onError?: (url: string, params: APIQueryParams, errorCode?: number) => void;
}

/**
 * Customisable callbacks, used for logging
 */
export const fetchCallbacks: AxiosCallbacks = {
	onStart: (url) => console.log('Fetching:', url),
};

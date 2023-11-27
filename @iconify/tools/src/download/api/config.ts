import { AxiosRequestConfig } from 'axios';
import { APIQueryParams } from './types';

/**
 * Axios config, customisable
 */
export const axiosConfig: AxiosRequestConfig = {
	// Empty by default. Add properties
};

interface AxiosLog {
	onStart?: (url: string, params: APIQueryParams) => void;
	onSuccess?: (url: string, params: APIQueryParams) => void;
	onError?: (url: string, params: APIQueryParams, errorCode?: number) => void;
}

/**
 * Customisable console.log for fetching
 */
export const axiosLog: AxiosLog = {
	onStart: (url) => console.log('Fetching:', url),
};

/**
 * Get error message from Figma API response
 */
export function getFigmaErrorMessage(
	status: number,
	response?: Response
): string {
	if (response) {
		switch (status) {
			case 429: {
				const retryAfter = response.headers.get('Retry-After');
				const extraMessage = retryAfter
					? ` Try again after ${retryAfter} seconds.`
					: '';
				return `Error retrieving document from API: rate limit exceeded.${extraMessage}`;
			}
		}
	}
	return `Error retrieving document from API: ${status}`;
}

export interface StyleParseError {
	type: 'style-parse-error';
	message: string;
	code: string;
	index?: number;
	fullMessage: string;
}

/**
 * Create error message
 */
export function styleParseError(
	message: string,
	code: string,
	index?: number
): StyleParseError {
	let fullMessage = message;
	if (typeof index === 'number' && index !== -1) {
		const start = index;

		// Check for space on left side of remaining code to calculate line start correctly
		const remaining = code.slice(index) + '!';
		const trimmed = remaining.trim();
		const end = start + remaining.length - trimmed.length;

		const code2 = code.slice(0, end);
		const line = code2.length - code2.replace(/\n/g, '').length + 1;
		fullMessage = message + ' on line ' + line;
	}

	return {
		type: 'style-parse-error',
		message,
		code,
		index,
		fullMessage,
	};
}

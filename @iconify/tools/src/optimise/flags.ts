import type { SVG } from '../svg';
import { parseSVG } from '../svg/parse';

/**
 * Command constants
 */
const CLOSE_PATH = 1;
const MOVE_TO = 2;
const HORIZ_LINE_TO = 4;
const VERT_LINE_TO = 8;
const LINE_TO = 16;
const CURVE_TO = 32;
const SMOOTH_CURVE_TO = 64;
const QUAD_TO = 128;
const SMOOTH_QUAD_TO = 256;
const ARC = 512;

/**
 * Number of arguments for each command
 */
const argCount: Record<string, number> = {
	[MOVE_TO]: 2,
	[LINE_TO]: 2,
	[HORIZ_LINE_TO]: 1,
	[VERT_LINE_TO]: 1,
	[CLOSE_PATH]: 0,
	[QUAD_TO]: 4,
	[SMOOTH_QUAD_TO]: 2,
	[CURVE_TO]: 6,
	[SMOOTH_CURVE_TO]: 4,
	[ARC]: 7,
};

/**
 * Check if character is a digit
 */
const isDigit = (num: number): boolean => num >= 48 && num <= 57;

/**
 * Check if character is white space
 */
const isWhiteSpace = (num: number): boolean =>
	num === 32 || num === 9 || num === 13 || num === 10;

/**
 * Clean up path
 *
 * @param {string} path
 * @return {string}
 */
function cleanPath(path: string): string {
	interface Command {
		command: string;
		params: string[];
	}

	const commands: Command[] = [];
	const length = path.length;

	let currentNumber = '';
	let currentNumberHasExp = false;
	let currentNumberHasExpDigits = false;
	let currentNumberHasDecimal = false;
	let canParseCommandOrComma = true;
	let currentCommand: string | null = null;
	let currentCommandType: number | null = null;
	let currentArgs: string[] = [];
	let i = 0;

	const finishCommand = () => {
		if (currentCommand !== null) {
			commands.push({
				command: currentCommand,
				params: currentArgs.slice(0),
			});
			currentArgs = [];
			canParseCommandOrComma = true;
		}
	};

	const parseNumber = () => {
		// Number ended - validate it
		if (currentNumber !== '' && currentCommandType) {
			let value = Number(currentNumber);
			if (isNaN(value)) {
				throw new Error(
					'Invalid number "' + currentNumber + '" at ' + i
				);
			}

			// Validate arc arguments
			if (currentCommandType === ARC) {
				if (currentArgs.length < 2 && value <= 0) {
					throw new Error(
						'Expected positive number, got "' + value + '" at ' + i
					);
				}

				// eslint-disable-next-line no-constant-condition
				while (true) {
					// Not flag
					if (currentArgs.length < 3 || currentArgs.length > 4) {
						break;
					}
					// Valid flag
					if (currentNumber === '0' || currentNumber === '1') {
						break;
					}
					// Unpack flag
					const slice = currentNumber.slice(0, 1);
					const newNumber = currentNumber.slice(1);
					const newValue = Number(newNumber);

					if (slice === '0' || slice === '1') {
						// Valid flag
						if (isNaN(newValue)) {
							throw new Error(
								'Invalid number "' + currentNumber + '" at ' + i
							);
						}
						currentArgs.push(slice);
						currentNumber = newNumber;
						value = newValue;
						continue;
					}

					throw new Error(
						'Expected a flag, got "' + currentNumber + '" at ' + i
					);
				}
			}

			// Add current number to arguments list
			currentArgs.push(currentNumber);

			if (currentArgs.length === argCount[currentCommandType]) {
				finishCommand();
			}

			currentNumber = '';
			currentNumberHasExpDigits = false;
			currentNumberHasExp = false;
			currentNumberHasDecimal = false;
			canParseCommandOrComma = true;
		}
	};

	for (i = 0; i < length; i++) {
		const char = path[i];
		const num = char.charCodeAt(0);

		// Test for number
		if (isDigit(num)) {
			currentNumber += char;
			currentNumberHasExpDigits = currentNumberHasExp;
			continue;
		}

		// Test for exponential number
		if (char === 'e' || char === 'E') {
			currentNumber += char;
			currentNumberHasExp = true;
			continue;
		}

		// Test for number signs
		if (
			(char === '-' || char === '+') &&
			currentNumberHasExp &&
			!currentNumberHasExpDigits
		) {
			currentNumber += char;
			continue;
		}

		// Decimal point
		if (char === '.' && !currentNumberHasExp && !currentNumberHasDecimal) {
			currentNumber += char;
			currentNumberHasDecimal = true;
			continue;
		}

		// Number ended - validate it
		parseNumber();

		// White space
		if (isWhiteSpace(num)) {
			continue;
		}

		// Only one comma per command
		if (canParseCommandOrComma && char === ',') {
			canParseCommandOrComma = false;
			continue;
		}

		// New number
		if (char === '+' || char === '-' || char === '.') {
			currentNumber = char;
			currentNumberHasDecimal = char === '.';
			continue;
		}

		// Expecting new command, so argument should be empty
		if (currentArgs.length > 0) {
			throw new Error('Unexpected command at ' + i);
		}

		// Test comma, reset value
		if (!canParseCommandOrComma) {
			throw new Error('Command cannot follow comma at ' + i + '');
		}
		canParseCommandOrComma = false;

		// Detect next command
		currentCommand = char;
		switch (char) {
			case 'z':
			case 'Z':
				// Close path
				commands.push({
					command: char,
					params: [],
				});
				canParseCommandOrComma = true;
				currentCommandType = null;
				currentCommand = null;
				break;

			case 'h':
			case 'H':
				// Horizontal move
				currentCommandType = HORIZ_LINE_TO;
				break;

			case 'v':
			case 'V':
				// Vertical move
				currentCommandType = VERT_LINE_TO;
				break;

			case 'm':
			case 'M':
				// Move to
				currentCommandType = MOVE_TO;
				break;

			case 'l':
			case 'L':
				// Line to
				currentCommandType = LINE_TO;
				break;

			case 'c':
			case 'C':
				// Curve
				currentCommandType = CURVE_TO;
				break;

			case 's':
			case 'S':
				// Smooth curve
				currentCommandType = SMOOTH_CURVE_TO;
				break;

			case 'q':
			case 'Q':
				// Quadratic bezier curve
				currentCommandType = QUAD_TO;
				break;

			case 't':
			case 'T':
				// Smooth quadratic bezier curve
				currentCommandType = SMOOTH_QUAD_TO;
				break;

			case 'a':
			case 'A':
				// Elliptic arc
				currentCommandType = ARC;
				break;

			default:
				throw new Error('Unexpected character "' + char + '" at ' + i);
		}
	}

	// Parse last number
	parseNumber();

	// Add last command
	if (currentArgs.length) {
		if (!currentCommandType) {
			throw new Error('Empty path');
		}
		if (currentArgs.length !== argCount[currentCommandType]) {
			throw new Error('Unexpected end of path at ' + i);
		}
		finishCommand();
	}

	// Build path
	let output = '';
	commands.forEach((item) => {
		output += item.command;

		item.params.forEach((value, index) => {
			if (index > 0) {
				const char = value[0];
				// noinspection FallThroughInSwitchStatementJS
				switch (char) {
					case '-':
					case '+':
						// Number - no space
						break;

					case '.':
						// Dot - no space if previous entry was command
						if (index < 1) {
							break;
						}

						// No space if previous entry had dot
						if (item.params[index - 1].indexOf('.') !== -1) {
							break;
						}

					// no-fallthrough
					default:
						output += ' ';
				}
			}
			output += value;
		});
	});

	return output;
}

/**
 * De-optimise paths. Compressed paths are still not supported by some software.
 */
export async function deOptimisePaths(svg: SVG): Promise<void> {
	await parseSVG(svg, (item) => {
		if (item.tagName !== 'path') {
			return;
		}
		const d = item.element.attribs.d;
		if (typeof d === 'string') {
			try {
				const optimised = cleanPath(d);
				if (optimised !== d) {
					item.$element.attr('d', optimised);
				}
			} catch (err) {
				//
			}
		}
	});
}

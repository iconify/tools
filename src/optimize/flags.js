/**
 * This file is part of the @iconify/tools package.
 *
 * (c) Vjacheslav Trushkin <cyberalien@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const cheerio = require('cheerio');
const SVG = require('../svg');

const debug = false;

/*
    Parts of code are based on svg-pathdata code (license: MIT)
 */

/**
 * Command constants
 *
 * @type {number}
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
const LINE_COMMANDS = LINE_TO | HORIZ_LINE_TO | VERT_LINE_TO;
const DRAWING_COMMANDS =
	HORIZ_LINE_TO |
	VERT_LINE_TO |
	LINE_TO |
	CURVE_TO |
	SMOOTH_CURVE_TO |
	QUAD_TO |
	SMOOTH_QUAD_TO |
	ARC;

/**
 * Number of arguments for each command
 *
 * @type {object}
 */
const argCount = {
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
 *
 * @param {number} num
 * @return {boolean}
 */
const isDigit = num => num >= 48 && num <= 57;

/**
 * Check if character is white space
 *
 * @param {number} num
 * @return {boolean}
 */
const isWhiteSpace = num => num === 32 || num === 9 || num === 13 || num === 10;

/**
 * Clean up path
 *
 * @param {string} path
 * @return {string}
 */
function cleanPath(path) {
	let commands = [],
		length = path.length,
		currentNumber = '',
		currentNumberHasExp = false,
		currentNumberHasExpDigits = false,
		currentNumberHasDecimal = false,
		canParseCommandOrComma = true,
		currentCommand = null,
		currentCommandType = null,
		currentArgs = [],
		i,
		char,
		num;

	const finishCommand = () => {
		if (debug) {
			console.log('Finishing command "' + currentCommand + '"', currentArgs);
		}
		commands.push({
			command: currentCommand,
			params: currentArgs.slice(0),
		});
		currentArgs = [];
		canParseCommandOrComma = true;
	};

	const parseNumber = () => {
		// Number ended - validate it
		if (currentNumber !== '' && currentCommandType) {
			let value = Number(currentNumber);
			if (isNaN(value)) {
				throw new Error('Invalid number "' + currentNumber + '" at ' + i);
			}

			// Validate arc arguments
			if (currentCommandType === ARC) {
				if (currentArgs.length < 2 && value <= 0) {
					if (debug) {
						console.log(
							'Command: "' + currentCommand + '", args: ',
							currentArgs
						);
					}
					throw new Error(
						'Expected positive number, got "' + value + '" at ' + i
					);
				}

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
					let slice = currentNumber.slice(0, 1),
						newNumber = currentNumber.slice(1),
						newValue = Number(newNumber);

					if (slice === '0' || slice === '1') {
						// Valid flag
						if (isNaN(newValue)) {
							throw new Error('Invalid number "' + currentNumber + '" at ' + i);
						}
						if (debug) {
							console.log('Compressed flag "' + slice + '" at ' + i);
						}
						currentArgs.push(slice);
						currentNumber = newNumber;
						value = newValue;
						continue;
					}

					if (debug) {
						console.log(
							'Command: "' + currentCommand + '", args: ',
							currentArgs
						);
					}
					throw new Error(
						'Expected a flag, got "' + currentNumber + '" at ' + i
					);
				}
			}

			// Add current number to arguments list
			if (debug) {
				console.log('End of number "' + currentNumber + '" at ' + i);
			}
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

	if (debug) {
		console.log('Parsing "' + path + '"');
	}

	for (i = 0; i < length; i++) {
		char = path[i];
		num = char.charCodeAt(0);

		// Test for number
		if (isDigit(num)) {
			// console.log('Digit "' + char + '" at ' + i);
			currentNumber += char;
			currentNumberHasExpDigits = currentNumberHasExp;
			continue;
		}

		// Test for exponential number
		if (char === 'e' || char === 'E') {
			// console.log('Digit "' + char + '" at ' + i);
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
			// console.log('Digit "' + char + '" at ' + i);
			currentNumber += char;
			continue;
		}

		// Decimal point
		if (char === '.' && !currentNumberHasExp && !currentNumberHasDecimal) {
			// console.log('Digit "' + char + '" at ' + i);
			currentNumber += char;
			currentNumberHasDecimal = true;
			continue;
		}

		// Number ended - validate it
		parseNumber();

		// White space
		if (isWhiteSpace(num)) {
			// console.log('Whitespace "' + char + '" at ' + i);
			continue;
		}

		// Only one comma per command
		if (canParseCommandOrComma && char === ',') {
			// console.log('Comma at ' + i);
			canParseCommandOrComma = false;
			continue;
		}

		// New number
		if (char === '+' || char === '-' || char === '.') {
			// console.log('Digit "' + char + '" at ' + i);
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
		// console.log('New command "' + char + '" at ' + i);
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

	commands.forEach(item => {
		output += item.command;

		item.params.forEach((value, index) => {
			if (index > 0) {
				let char = value[0];
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
 * Undo compressed flags
 *
 * @param {string|SVG} code
 * @return {string|SVG}
 */
const cleanUpFlags = code => {
	let svg = typeof code === 'object' ? code : new SVG(code),
		$root = svg.$svg(':root');

	function checkNodes($parent) {
		$parent.children().each((index, child) => {
			let $child = cheerio(child);

			switch (child.tagName) {
				case 'path':
					if (child.attribs && child.attribs.d) {
						child.attribs.d = cleanPath(child.attribs.d);
					}
					break;
			}

			checkNodes($child);
		});
	}

	checkNodes($root);

	return typeof code === 'object' ? svg : svg.toString();
};

module.exports = cleanUpFlags;

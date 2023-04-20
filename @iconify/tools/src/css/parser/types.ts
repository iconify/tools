/**
 * Text tokens, to be split combined into correct tokens later
 */
export interface TextToken {
	type: 'chunk' | 'url' | 'quoted-string';
	index: number;
	text: string;
}

/**
 * Values
 */
export type CSSATValue = string | string[];

/**
 * Tokens
 */
// Simple rule
export interface CSSRuleToken {
	type: 'rule';
	index: number;
	prop: string;
	value: string;
	important?: boolean;
}

// Selector. Followed by children tokens until close token
export interface CSSSelectorToken {
	type: 'selector';
	index: number;
	code: string;
	selectors: string[];
}

// At-rule. Followed by children tokens until close token
export interface CSSAtRuleToken {
	type: 'at-rule';
	index: number;
	rule: string;
	value: string;
}

// Closes selector or at-rule: '}'
export interface CSSCloseToken {
	type: 'close';
	index: number;
}

export type CSSTokenWithSelector = CSSSelectorToken | CSSAtRuleToken;

export type CSSToken =
	| CSSRuleToken
	| CSSSelectorToken
	| CSSAtRuleToken
	| CSSCloseToken;

/**
 * Tree tokens
 */
export interface CSSSelectorTreeToken extends CSSSelectorToken {
	children: CSSTreeToken[];
}

export interface CSSAtRuleTreeToken extends CSSAtRuleToken {
	children: CSSTreeToken[];
}

export type CSSTreeToken =
	| CSSRuleToken
	| CSSSelectorTreeToken
	| CSSAtRuleTreeToken;

/// Utilities for simpler usage with JavaScript strings.

const DIGIT_EXPRESSION = /^\d$/;

/**
 * Tells if the given character is a digit.
 *
 * @example
 * is_digit("1"); // true
 * is_digit("a"); // false
 * is_digit("10"); // false
 */
export const is_digit = (character: string): boolean => {
  return Boolean(character) && DIGIT_EXPRESSION.test(character);
};

/**
 * Tells if the given character is a space.
 * @example
 * is_space(" "); // true
 * is_space("a"); // false
 */
export const is_space = (character: string): boolean => {
  return character === " ";
};

export const is_newline = (character: string): boolean => {
  return character === "\n";
};

const ALPHA_REGEX = new RegExp("[A-Za-zÀ-ÖØ-öø-ÿ]");
const ALNUM_REGEX = new RegExp("[A-Za-zÀ-ÖØ-öø-ÿ0-9]");

/**
 * Tells if the given character is alphanumeric.
 * @example
 * is_alnum("a"); // true
 * is_alnum("é"); // true
 * is_alnum("1"); // true
 * is_alnum(" "); // false
 */
export const is_alnum = (character: string): boolean => {
  return ALNUM_REGEX.test(character);
};

/**
 * Tells if the given character is alphabetic.
 * @example
 * is_alpha("a"); // true
 * is_alpha("é"); // true
 * is_alpha("1"); // false
 * is_alpha(" "); // false
 */
export const is_alpha = (character: string): boolean => {
  return ALPHA_REGEX.test(character);
};

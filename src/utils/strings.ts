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

/**
 * Tells if the given character is alphanumeric.
 * @example
 * is_alnum("a"); // true
 * is_alnum("1"); // true
 * is_alnum(" "); // false
 */
export const is_alnum = (character: string): boolean => {
  const regex = new RegExp("[A-Za-zÀ-ÖØ-öø-ÿ0-9]");
  return regex.test(character);
};

/**
 * Tells if the given character is alphabetic.
 * @example
 * is_alpha("a"); // true
 * is_alpha("1"); // false
 * is_alpha(" "); // false
 */
export const is_alpha = (character: string): boolean => {
  const code = character.charCodeAt(0);

  if (
    !(code > 64 && code < 91) && // upper alpha (A-Z)
    !(code > 96 && code < 123)   // lower alpha (a-z)
  ) return false;

  return true;
};

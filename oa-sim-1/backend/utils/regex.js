const SPECIAL_CHARACTERS = /[.*+?^${}()|[\]\\]/g;

/**
 * Escapes user input so it can be embedded in a RegExp and matched literally.
 */
export const escapeRegex = (value) => String(value).replace(SPECIAL_CHARACTERS, '\\$&');

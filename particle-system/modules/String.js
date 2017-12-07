/**
 * Capitalize string.
 * Example: 'foo'.capitalize() -> 'Foo'
 * @returns {string} - capitalized string
 */
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.substring(1);
};
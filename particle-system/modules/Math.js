/**
 * returns random int between min and max excluding max. Math.: [min, max[
 * returns random number between 0 and min if max is omitted.
 * @param min {int} - lower boundary
 * @param [max] [int} - upper boundary
 * @returns {int} - random int
 */
Math.randrange = (min, max) => {
    if (max === undefined || max === null) {
        max = min;
        min = 0;
    }
    return Math.random() * (max - min) + min;
};

/**
 * returns random int between min and max including max. Math.: [min, max]
 * returns random number between 0 and min if max is omitted.
 * @param min {int} - lower boundary
 * @param [max] [int} - upper boundary
 * @returns {int} - random int
 */
Math.randint = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

Math.PI2 = Math.PI / 2;
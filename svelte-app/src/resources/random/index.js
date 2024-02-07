class Random {
    static allLetters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    static allNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    /**
     * Create a string of random numbers.
     * @param {number} length 
     * @returns A string of random numbers 0-9 of the specified length.
     */
    static randomNumbers(length) {
        return Array.from(Array(length).keys()).map(() => { return Math.round(Math.random() * 9); }).join("");
    }
    /**
     * Create a string of random letters.
     * @param {number} length 
     * @param {boolean} includesNumbers 
     * @returns A string of random letters of the specified length.
     */
    static randomLetters(length, includesNumbers) {
        let currentArray = Random.allLetters;
        if (includesNumbers) {
            currentArray = [].concat(Random.allLetters, Random.allNumbers);
        }

        return Array.from(Array(length).keys()).map(() => {
            const idx = Math.round(Math.random() * (currentArray.length - 1));
            return currentArray[idx];
        }).join("");
    }

    /**
     * Shortcut for Random.randomLetters(50, true);
     * @returns 50 random letters with numbers included.
     */
    static randomID() {
        return Random.randomLetters(50, true);
    }
}

export default Random;
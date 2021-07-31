module.exports = function (n, min, max) {
    const toReturn = [];

    if (n >= max) {
        for (let i = 0; i < n; i++) {
            toReturn.push(i)
        }
    } else {
        for(let i = 0; i < n; i++) {
            const j = i;
            const rand = Math.floor(Math.random() * (max - min)) + min;
            if (toReturn.indexOf(rand) >= 0) {
                i--
            } else {
                toReturn.push(rand);
            }
        };
    }
    return toReturn;
}
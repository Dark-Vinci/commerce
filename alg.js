function getRandom(n, k) {
    const toReturn = [];
    if (n < 0) {
        return 'cant generate..'
    }

    let i = 0;
    for (;;) {
        const ki = Math.floor(Math.random() * (n - 0));
        if (toReturn.indexOf(ki) >= 0) {
            continue;
        } else {
            toReturn.push(ki);
            i++
        }

        if (i == k) {
            break
        }
    }

    return toReturn;
}

console.log(getRandom(10, 10))
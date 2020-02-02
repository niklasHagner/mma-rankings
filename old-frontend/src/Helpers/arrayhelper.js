function chunkify(a, n, balanced, returnEmptyArrays = false) {

    if (n < 2)
        return [a];

    var len = a.length,
        chunks = [],
        i = 0,
        size;

    if (len % n === 0) {
        size = Math.floor(len / n);
        while (i < len) {
            chunks.push(a.slice(i, i += size));
        }
    }

    else if (balanced) {
        while (i < len) {
            size = Math.ceil((len - i) / n--);
            chunks.push(a.slice(i, i += size));
        }
    }

    else {

        n--;
        size = Math.floor(len / n);
        if (len % size === 0)
            size--;
        while (i < size * n) {
            chunks.push(a.slice(i, i += size));
        }
        chunks.push(a.slice(size * n));

    }

    if (returnEmptyArrays) {
        while (chunks.length <= n)
            chunks.push([]);
    }

    return chunks;
}

export { chunkify }
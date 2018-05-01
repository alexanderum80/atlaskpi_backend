export const randomInteger = (length: number = 5) => Math.floor(Math.pow(10, length - 1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1) - 1));

export function dataSortDesc(a, b) {
    if (a.value > b.value) {
        return -1;
    }
    return 1;
}

export function dataSortAsc(a, b) {
    if (a.value > b.value) {
        return 1;
    }

    return -1;
}
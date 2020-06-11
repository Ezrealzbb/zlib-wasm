var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ中国打击👌🧐😳🤔😳🧐😛😍😱😍🧐🧐😳🤫🤔🤔🤫🤨✌🏼✌🏼';
export function randomString(length) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

export function calcAvg(arr: number[]) {
    return arr.reduce((pre, cur) => pre + cur, 0) / arr.length;
}
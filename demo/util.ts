// var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ中国打击👌🧐😳🤔😳🧐😛😍😱😍🧐🧐😳🤫🤔🤔🤫🤨✌🏼✌🏼';
var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ中国打击';
export function randomString(length) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

export function calcAvg(arr: number[]) {
    return arr.reduce((pre, cur) => pre + cur, 0) / arr.length;
}

export function checkDiffText(str1: string, str2: string) {
    if (str1.length !== str2.length) {
        return false;
    }

    for (let i = 0; i < str1.length; ++i) {
        if(str1[i] !== str2[i]) {
            console.log('checkDiffText', i, str1[i], str2[i]);
            return false;
        } 
    }
    return true;
}

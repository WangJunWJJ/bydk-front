import Decimal from 'decimal.js';

export function setDigits(target: number | undefined, fixed = 3) {
  if (!target || typeof target !== 'number') {
    return 0;
  }
  return new Decimal(target).toDP(fixed).toNumber();
}

/**
 * 获取指定rate的opacity
 *
 * @export
 * @param {number} rate 0<=rate<=1
 */
export function getOpacity(rate: number, min: number = 0, max: number = 1) {
  return rate ** 2 * (max - min) + min;
}

/**
 * 下载文件接口
 *
 * @export
 * @param {string} url 文件oss地址
 * @param {string} fileName 文件名
 */
export function downloadFile(url: string, fileName: string) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'blob';

  xhr.onload = function (e) {
    var url = window.URL.createObjectURL(xhr.response);
    var a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();

    console.log(a);
  };

  xhr.send();
}

/**
 * 产生随机字符串 默认长度32
 *
 * @export
 * @param {number} [length=32]
 * @param {string} [chars='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789']
 * @return {*}  {string}
 */
export function nonceStr(length: number = 32, chars: string = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'): string {
  const len = chars.length;
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * len));
  }
  return result;
}

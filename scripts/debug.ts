/**
 * @desc: 调试
 * @author: john_chen
 * @date: 2023.05.11
 */
let cookies = [
  {
    name: 'a',
    value: '123'
  },
  {
    name: 'b',
    value: '456'
  }
];


export function setCookie(cookies: object[]): void {
  for (let cookie of cookies) {
    console.log(cookie);
  }
}

setCookie(cookies);



// eslint-disable-next-line @typescript-eslint/no-var-requires
const data = require('./data');

const regExp = /<\/circle><\/g><\/svg><\/span><a href="(.*?)">(.*?)<\/a>/g;
let text = '';
let result;

// eslint-disable-next-line no-cond-assign
while (result = regExp.exec(data)) text += `"${result[2]}": "${result[1]}"\n`;

console.log(text);

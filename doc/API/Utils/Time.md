# Class: Time

Time 提供时间相关方法。

## Example

```javascript
const { time } = require('multi-automator');

console.log(1);
// sleep 3000毫秒
await time.delay(3000);
console.log(2);
```

## Function

#### time.delay(ms)

延时

- `ms` <number\> 时间（毫秒）

- `returns` <Promise\>

#### time.currentTimestamp(type)

获取当前时间戳

- `type` <string\> 时间类型，ms：毫秒，s：秒，默认：ms

- `returns` <number\> 时间戳

# Class: File

File 提供文件操作相关方法。

## Example

```javascript
const { file } = require('multi-automator');

await file.mkdir('test');
```

## Function

#### file.mkdir(dirPath)

创建目录

- `dirPath` <string\> 目录路径

#### file.rmdir(dirPath)

删除目录以及目录下的所有文件

- `dirPath` <string\> 目录路径
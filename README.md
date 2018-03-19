# css2pre

------

该库用于将css转换为预处理语言， 列如less，scss；

> * 无依赖
> * 简明的api
> * 最大兼容
> * 最小合并
> * 保留顺序
> * 保留注释

------

![css](https://github.com/biorz/css2pre/blob/master/demo/css.png = 300x) ![sass](https://github.com/biorz/css2pre/blob/master/demo/sass.png =300x)

## 优点
最大兼容，在保留原css顺序，注释等内容的基础上，最小合并相邻的块；

### 1. 开始
```
import css2pre from '../lib/css2pre'

let less = css2pre('html, body{ margin:0;padding:0; }')
    .to('less')
```

### 2. 待办事宜
- [x] 嵌套, 缩进
- [x] 保留注释
- [x] 保留顺序
- [ ] 浏览器私有前缀

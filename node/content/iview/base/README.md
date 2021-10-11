## 变脸
```
@width: 10px;
@height: @width + 10px;
#header {
  width: @width;
  height: @height;
}
```

## 混入
```
.bordered {
  border-top: dotted 1px black;
  border-bottom: solid 2px black;
}
.post a {
  color: red;
  .bordered();
}
```
## 嵌套
```
#header {
  color: black;
  .navigation {
    font-size: 12px;
  }
  .logo {
    width: 300px;
  }
}
```
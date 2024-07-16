使用[TypeScriptToLua](https://github.com/TypeScriptToLua/TypeScriptToLua)
编写的适用于怪物猎人崛起的[REFramework](https://github.com/praydog/REFramework)Lua脚本模组

## 构建

```
npm install
npm run build
```

还需要自行下载NotoSansSC-Bold.otf字体放到`游戏根目录\reframework\fonts`下

## TypeScriptToLua的限制

不支持在静态字段/字段(不确定)中使用this<br>
不支持使用get属性作为参数<br>
不支持继承Array<类型><br>
不支持使用new Array<类型>创建Array只能使用[]加类型注解创建

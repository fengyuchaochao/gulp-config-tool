# gulp-config-tool 

gulp-config-tool 是一个基于gulp封装的npm包，它内部集成好了gulpfile.js等配置文件，我们只需要直接使用该工具提供的命令，即可实现打包，本地调试等功能


## 第一步：初始化项目

该工具需要配合脚手架gulp-page-cli去使用，具体使用方法请参考https://www.npmjs.com/package/gulp-page-cli
```
mkdir page-demo
cd page-demo
gulp-page-cli // 执行该命令，生成初始化文件
```

## 第二步：安装当前包

```
npm install gulp-config-tool --save-dev
```

## 第三步：使用命令

安装完成以后，该工具提供了build和dev两个命令

```
gulp-config-tool build // 打包文件
gulp-config-tool dev //开启本地服务
```

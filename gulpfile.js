var gulp = require('gulp');
var pug = require('gulp-pug');
var changed = require('gulp-changed');
var debug = require('gulp-debug');
var uglify = require('gulp-uglify');
var gulpif = require('gulp-if');
var minimist = require('minimist');
var sass = require('gulp-sass');
var connect = require('gulp-connect');
var proxy = require('http-proxy-middleware');
//var rev = require('gulp-rev');                      // 生成md5签名
//var revReplace = require('gulp-rev-replace');       // 替换成md5签名的文件


var knownOptions = {
    string : 'env',
    default : {
        env: 'localhost',       // 默认是本地环境
        rev: 'false'            // 是否生成md5签名，暂时还用不到
    }
}

var options = minimist(process.argv.slice(2), knownOptions);

var contentPath = 'WebContent/';

var pugPath = contentPath + 'src/pug/',
    saccPath = contentPath + 'src/sass/',
    jsPath = contentPath + 'src/js/',
    imgPath = contentPath + 'src/imgs/',  // 图片路径，暂时没用
    destPath = contentPath + 'page/',
    configPath = contentPath + 'env/',
    rootPath = contentPath + 'page',
    proxyUrl= 'http://localhost:8084';


// 设置配置信息
gulp.task('config', function() {
    gulp.src(configPath + options.env + '/wyxm-constant.js')
    //.pipe(uglify())
    .pipe(gulp.dest(destPath));
});

// pug编译
gulp.task('pug', function() {
    gulp.src([ pugPath + '**/*.pug', '!' + pugPath + 'common/*.pug', '!' + pugPath + 'common/userInfo/*.pug']).pipe(pug({
        pretty : true
    })).pipe(gulp.dest(destPath));
});


// sass编译
gulp.task('sass', function() {
    gulp.src(saccPath + '**/*.scss').pipe(sass()).pipe(
            gulp.dest(destPath));
});

// js编译
gulp.task('uglify', function () {
    gulp.src(jsPath + '**/**.js')
        //.pipe(uglify())
        .pipe(gulp.dest(destPath));
});

// img编译
gulp.task('img', function () {
    gulp.src(imgPath + '**/*')
        //.pipe(uglify())
        .pipe(gulp.dest(destPath));
});

// 监控--只在开发环境进行
gulp.task('watch', function() {
    gulp.watch(pugPath + '**/*.pug', ['pug']);
    gulp.watch(saccPath + '**/*.scss', ['sass']);
    gulp.watch(jsPath + '**/*.js', ['uglify']);
    gulp.watch(imgPath + '**/*', ['img']);
});

gulp.task('default', function() {
    
});

// 启动服务--只在开发环境进行
gulp.task('webserver', function() {
    connect.server({
      port:8081,
      root:rootPath,
      livereload: true,
      middleware: function (connect, opt) {
        return [
            proxy('/sword',  {
                target: proxyUrl,
                changeOrigin:true
            }),
            proxy('/TRSIdSSSOProxyServlet',  {
                target: proxyUrl,
                changeOrigin:true
            })
         ]
      }
    });
});

gulp.task('default', [ 'config', 'pug', 'sass', 'uglify', 'img'],function(){

    if(options.env=='localhost') {
        gulp.run('watch');
        gulp.run('webserver');
    }
});


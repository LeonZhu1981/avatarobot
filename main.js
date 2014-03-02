var casper = require('casper').create({    
    verbose: true,   
    logLevel: 'debug',   
    pageSettings: {   
         loadImages:  false,   
         loadPlugins: false,    
         userAgent: 'Mozilla/5.0 (Windows NT 6.1; rv:17.0) Gecko/20100101 Firefox/17.0'   
    },  
    viewportSize: {  
        width: 1024,  
        height: 768  
    },  
    clientScripts:  [  
        'lib/jquery.min.js'
    ]  
});   
  
casper.options.viewportSize = {width: 1680, height: 924};

var fs = require('fs'),
    system = require('system');

//load cookie data from file.
var data = fs.read("cookie.txt");
phantom.cookies = JSON.parse(data);

//load configuration from file.
var configFileName = 'conf.json';
var config = initGlobalConfig(fs, configFileName);

//read song line array from file.
var songLines = buildSongArrayByLocalFile(fs);

//start http request to remote web site.
casper.start(config.url); 

//handle request for post data to target bbs.
casper.then(function() {
    this.test.assertExist("#fastpostmessage", '成功登录论坛!');
    this.each(songLines, function(self, song){
        if (song.trim().length > 0) { 
            self.wait(config.interval, function(self) {
                self.fill('#fastpostform', {'message': song.trim()}, true);
            });
        }
    });
});

function initGlobalConfig(fileStream, fileName) {
    var fileContent = fileStream.read(fileName);
    if (fileContent.length > 0) {
        return JSON.parse(fileContent);
    }
    else {
        throw "程序错误! 加载配置文件conf.json不成功";
    }
}

function buildSongArrayByLocalFile(fileStream) {
    var eol = system.os.name == 'windows' ? "\r\n" : "\n";
    var fileContent = fileStream.read(config.fileName);
    if (fileContent.length == 0) {
        throw "程序错误! " + config.fileName + "文件不存在或者内容为空!";
    }
    return fileContent.split(eol);
}

casper.run();
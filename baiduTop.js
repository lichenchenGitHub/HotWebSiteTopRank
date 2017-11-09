/**
 * Created by lichenchen on 2016/9/12.
 */
var cluster = require('cluster');
var crypto = require('crypto');
var Promise = require("bluebird");
var conf = require("./conf/config");
var root = process.cwd();
var dataDeal = require(root + conf.dataDeal);
var parseContent = require(root + conf.baiduTop.parseContent);
var mongoose = require('./lib/mongoose');
var BaiduTopContent = require('./model/baidu_top_content.js');
var baiduTopModel = BaiduTopContent.GetMongoDataModel(mongoose);
var closing = false;
var flag = true;//等待标识
var urlList = conf.baiduTop.urlList;

if (cluster.isMaster) {
    console.log("master start...");
    var forkWorker = function () {
        var worker = cluster.fork();
        worker.on('error', function (err) {
            console.log('worker error: ' + err);
        });

        console.log('worker ' + worker.process.pid + ' forked at: ' + new Date());
        return worker;
    };

    cluster.on('exit', function (worker, code, signal) {
        if (signal) {
            console.log('worker ' + worker.process.pid + ' was killed by signal: ' + signal);
        }
        else if (code !== 0) {
            console.log('worker ' + worker.process.pid + ' exited with error code: ' + code);
            forkWorker();
        }
        else {
            console.log('worker ' + worker.process.pid + ' exited success!');
        }
    });
    var quitScheduler = function () {
        if (!closing) {
            closing = true;

            for (var id in cluster.workers) {
                console.log('Closing worker id: ' + id);
                cluster.workers[id].kill('SIGTERM');
            }

            mongoose.connection.close();

            setTimeout(function () {
                process.exit(0);
            }, 1000);
        }
    };

    process.once("SIGINT", quitScheduler);
    process.once("SIGTERM", quitScheduler);


    var workerCount = 1;
    for (var i = 0; i < workerCount; i++) {
        forkWorker();
    }
} else {
    var reportInterval = null;
    var quitWorker = function () {
        if (!closing) {
            closing = true;

            console.log('worker shutting down...');
            if (reportInterval) {
                clearInterval(reportInterval);
                reportInterval = null;
            }
            mongoose.connection.close();
            process.exit(0);
        }
    };

    process.on('message', function (msg) {
        if (msg == 'shutdown') {
            quitWorker();
        }
    });

    process.once("SIGINT", quitWorker);
    process.once("SIGTERM", quitWorker);

    var crawlData = function () {
        if (flag) {
            flag = false;
            Promise.map(urlList, function (url, index) {
                //爬取数据
                return dataDeal.crawllingData(url, conf.baiduTop.dataType).then(function (data) {
                    //数据映射
                    return parseContent.filterList(data, url, function () {
                        return dataDeal.getUrlInfo(url);
                    }, function () {
                        return dataDeal.getTodayDate();
                    });
                }).then(function (data) {
                    return Promise.map(data, function (content, index) {
                        //数据逐条入库
                        return dataDeal.insertOrUpdate(baiduTopModel, content, url);
                    }).then(function (data) {
                        //写入日志表
                        return dataDeal.writeLog(url, function () {
                            return dataDeal.getTodayDate();
                        }, function () {
                            return dataDeal.getUrlInfo(url);
                        });
                    });
                });
            }).then(function (data) {
                flag = true;
                console.log(data);
                return;
            }).catch(function (err) {
                flag = true;
                console.log(err);
                return;
            })
        }
        else {
            console.log("flag:" + flag + "at " + new Date());
            flag = true;
            return;
        }
    }
    //定时爬去，时间间隔30分至60分随机
    reportInterval = setInterval(crawlData, dataDeal.getRandomNum(10800000, 21600000));
    crawlData();


}

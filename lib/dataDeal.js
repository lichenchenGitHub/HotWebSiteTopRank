/**
 * Created by lichenchen on 2016/9/18.
 */
var unirest = require('unirest');
var URL = require('url');
var querystring = require("querystring");
var Promise = require("bluebird");
var iconv = require('iconv-lite');
var mongoose = require('../lib/mongoose');
var CrawllingLogContent = require('../model/crawlling_log_content.js');
var crawllingLogModel = CrawllingLogContent.GetMongoDataModel(mongoose);
var conf = require("../conf/config");
var poolOption = {
    maxSockets: 50,
};
exports.getRandomNum = function (min, max) {
    var Range = max - min;
    var Rand = Math.random();
    var num = min + Math.round(Rand * Range);
    return num;
}
exports.getTodayDate = function () {
    var today = new Date();
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    today.setMilliseconds(0);
    return today / 1;
}
exports.getUrlInfo = function (url) {
    var obj = {};
    var webInfo = URL.parse(url);
    var website = "";
    website = webInfo.hostname;
    var listType = "";
    switch (website) {
        case "top.baidu.com":
            listType = querystring.parse(webInfo.query).b;
            break;
        case "movie.douban.com":
            listType = querystring.parse(webInfo.query).type;
            break;
        case "index.api.youku.com":
            listType = querystring.parse(webInfo.query).channelId;
            break;
        default:
            break;

    }
    obj.website = website;
    obj.listType = listType;
    return obj;
}
exports.crawllingData = function (url, type) {
    return new Promise(function (resolve, reject) {
        var req = unirest.get(url);
        req.pool(poolOption);

        if (type == 0) {
            req.headers(conf.doubanTop.headers);
            req.encoding("binary");
        }
        if (type == 1) {
            req.headers(conf.youkuTop.headers);
        }
        if (type == 2) {
            req.headers(conf.doubanTop.headers);
        }
        var params = URL.parse(url).query;
        var channelId = querystring.parse(params).channelId;
        var obj = {};
        req.end(function (res) {
            if (res.status != 200) {
                reject(url + ":statusCode:" + res.statusCode);
            } else {
                var data = res.body;
                if (type == 0) {
                    data = iconv.decode(new Buffer(data, 'binary'), 'gbk');
                }
                resolve(data);
            }
        })
    });
}
exports.findLog = function (url, parseUrl, getTodayData) {
    return new Promise(function (resolve, reject) {
        var obj = parseUrl();
        if (obj.website != null && obj.website != "" && obj.listType != null && obj.listType != "") {
            obj.ctime = getTodayData();
            console.log(obj);
            var query = {website: obj.website, listType: obj.listType, ctime: obj.ctime};
            crawllingLogModel.Model.count(query, function (err, count) {
                if (err) {
                    console.log(query);
                    reject("Error :" + url + " " + err);
                } else {
                    if (count > 0) {
                        reject(url + " today's data has crawlled at "+new Date());
                    } else {
                        console.log(url + " today's data start crawlling at "+new Date());
                        resolve(url);
                    }
                }
            })
        } else {
            reject("Error :" + url + " 获取域名和参数失败 at" +new Date());
        }
    });
}
exports.insertOrUpdate = function (model, content, url) {
    return new Promise(function (resolve, reject) {
        model.Model.update({
            currentRank: content.currentRank,
            firstCategory: content.firstCategory,
            ctime: content.ctime
        }, content, {upsert: true, setDefaultsOnInsert: true}, function (err, data) {
            if (err) {
                reject("Error :" + url + " " + err +" at "+new Date())
            } else {
                resolve(data);
            }
        })
    });
}
exports.writeLog = function (url, getTodayData, getUrlInfo) {
    return new Promise(function (resolve, reject) {
        var obj = getUrlInfo();
        if (obj.website != null && obj.website != "" && obj.listType != null && obj.listType != "") {
            var status = true;
            var website = obj.website;
            var listType = obj.listType;
            obj.ctime = getTodayData();
            var doc = new CrawllingLogContent(website, listType, status, obj.ctime);
            var query = {website: obj.website, listType: obj.listType, ctime: obj.ctime};
            crawllingLogModel.Model.count(query, function (err, count) {
                if (err) {
                    console.log(query);
                    reject("Error :" + url + " " + err +" at "+new Date());
                } else {
                    if (count > 0) {
                        resolve(url + " today's data has crawlled at " +new Date());
                    } else {
                        crawllingLogModel.save(doc, function (err, content) {
                            if (err) {
                                reject("Error : writeLog " + url + err +" at "+new Date());
                            } else {
                                resolve(content);
                            }
                        })
                    }
                }
            })
        } else {
            reject("Error :" + url + " " + "获取域名和参数失败 at "+new Date());
        }

    });
}


/**
 * Created by lichenchen on 2016/9/18.
 */
var Promise = require("bluebird");
var jsdom = require("jsdom");
var fs = require("fs");
var jquery = fs.readFileSync('./public/javascripts/jquery-1.11.3.min.js').toString();

exports.filterList = function (data, url, getUrlInfo, getTodayData) {
    var vlist = [];
    var obj = {};
    obj.data = data;
    obj.firstCategory = getUrlInfo().listType;
    obj.ctime = getTodayData();
    return new Promise(function (resolve, reject) {
        jsdom.env({
            html: obj.data,
            src: [jquery],
            done: function (err, window) {
                if (err) {
                    reject(JSON.stringify({role: 'jsdom', err: err}));
                }
                else {
                    var $ = window.$;
                    var trs = $("#main > div.mainBody > div > table > tbody > tr");
                    var lineCount = 0;
                    trs.each(function () {
                        var index = trs.index(this);
                        if ($(this).is('.item-tr') || index == 0) {
                        }
                        else {
                            lineCount++;
                            var currentRank = $(this).find("td.first>span").text();
                            var keyword = $(this).find("td.keyword >a.list-title").html();
                            var searchInfo = $(this).find("td.last>span");
                            var searchVolume = searchInfo.text();
                            var trend = 0;
                            if (searchInfo.attr('class') == "icon-fall") {
                                trend = -1;
                            } else if (searchInfo.attr('class') == "icon-rise") {
                                trend = 1;
                            } else if (searchInfo.attr('class') == "icon-fair") {
                                trend = 0;
                            }
                            if (keyword != null && keyword != "" && currentRank != null && currentRank != "" && searchVolume != null && searchVolume != "") {
                                vlist.push({
                                    title: escape(keyword),
                                    currentRank: currentRank,
                                    searchVolume: searchVolume,
                                    trend: trend,
                                    firstCategory: obj.firstCategory,
                                    secondCategory: 10000,
                                    ctime: obj.ctime
                                });
                            }
                        }
                    })
                    if (vlist.length != lineCount) {
                        reject("Error:" + url + " 获取长度缺失 at" +new Date());
                    } else {
                        resolve(vlist);
                    }


                }
            }
        });
    });
}

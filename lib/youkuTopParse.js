/**
 * Created by lichenchen on 2016/9/18.
 */
var Promise = require("bluebird");

exports.filterList = function (data, url, getUrlInfo, getTodayData) {
    return new Promise(function (resolve, reject) {
        if (data && data.result.data) {
            var obj = {};
            obj.dataList = data.result.data;
            obj.firstCategory = getUrlInfo().listType;
            obj.ctime = getTodayData();
            if (obj.dataList.length <= 0) {
                reject("Error : " + url + " length<=0 at " + new Date());
            } else {
                for (var i = 0; i < obj.dataList.length; i++) {
                    obj.dataList[i].ctime = obj.ctime;
                    obj.dataList[i].title = escape(obj.dataList[i].title);
                    obj.dataList[i].firstCategory = obj.firstCategory;
                    obj.dataList[i].secondCategory = 10000;
                    obj.dataList[i].searchVolume = obj.dataList[i].vv;
                    switch (obj.dataList[i].asubTrend) {
                        case "DOWN":
                            obj.dataList[i].trend = -1;
                            break;
                        case "UP":
                            obj.dataList[i].trend = 1;
                            break;
                        default:
                            obj.dataList[i].trend = 0;
                            break;
                    }

                    obj.dataList[i].currentRank = obj.dataList[i].order;
                }
                resolve(obj.dataList);
            }
        } else {
            reject("Error : " + url + " data null at " + new Date());
        }

    });

}
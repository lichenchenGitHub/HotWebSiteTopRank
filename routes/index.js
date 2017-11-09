var express = require('express');
var URL = require('url');
var router = express.Router();
var mongoose = require('../lib/mongoose');
var BaiduTopContent = require('../model/baidu_top_content.js');
var baiduTopModel = BaiduTopContent.GetMongoDataModel(mongoose);
var YoukuContent = require('../model/youku_content.js');
var youkuModel = YoukuContent.GetMongoDataModel(mongoose);
var DoubanContent = require('../model/douban_top_content.js');
var doubanModel = DoubanContent.GetMongoDataModel(mongoose);
var Promise=require("bluebird");
var baiduMatch=[{key:96,value:26},{key:97,value:4},{key:85,value:19},{key:100,value:23}];
var doubanMatch=[{key:96,value:'movie'},{key:97,value:'tv'}];
/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'BYD_RANK'});
});
router.get('/getTopListByDay', function (req, res, next) {
    var listData = {};
    listData.code = 404;
    listData.message = "params error";
    listData.total = 0;
    listData.data = [];
    var params = URL.parse(req.url, true).query;
    if (params.source && params.category && params.timestamp && params.source != "" && params.category != "" && params.timestamp != "") {
        var source = params.source;
        var category = params.category;
        var timestamp =getDate(params.timestamp);
        var model = null;

        switch (parseInt(source)) {
            case 1:
                model = baiduTopModel;
                break;
            case 2:
                model = youkuModel;
                break;
            case 3:
                model = doubanModel;
                break;
            default:
                break;
        }
        if (model == null) {
            return res.status(200).json(listData);
        }
        var query = {firstCategory: category, ctime: timestamp};
        var sort_rules = { currentRank: 1 };
        model.Model.find(query).sort(sort_rules).exec(function (err, contents) {
            if (err) {

            } else {
                listData.code = 200;
                listData.message = "";
                listData.total = contents.length;
                listData.data = contents;
            }
            return res.status(200).json(listData);
        })
    } else {
        return res.status(200).json(listData);
    }

})
router.post('/getDataByDay',function(req,res,next){
    var reback={};
    var category=null;
    var ctime=null;
    var sort_rules = { currentRank: 1 };
    if(req.body.ctime){
        ctime=getDate(req.body.ctime);
    }
    if(req.body.category){
        category=req.body.category;
    }
    var findList=[{model:baiduTopModel,site:"baidu"},
        {model:youkuModel,site:"youku"},
        {model:doubanModel,site:"douban"}
    ]
    Promise.map(findList,function(item,index){
        return new Promise(function (resolve, reject) {
            var temp=category;
            if(item.site=="baidu")
            {
                baiduMatch.forEach(function(item,index){
                    if(item.key==parseInt(temp))
                    {
                        temp=item.value;
                    }
                })
            }
            if(item.site=="douban"){
                doubanMatch.forEach(function(item,index){
                    if(item.key==parseInt(temp))
                    {
                        temp=item.value;
                    }
                })
            }
            item.model.Model.find({ctime:ctime,firstCategory:temp}).sort(sort_rules).exec(function (err, contents) {
                if(err){
                    reject(err);
                }
                var obj={};
                obj.site=item.site;
                obj.list=contents;
                resolve(obj);
            });
        });
    }).then(function(data){
        reback.code=200;
        reback.date=req.body.ctime;
        reback.data=data;
        return res.status(200).json(reback)

    }).catch(function(err){
        return res.status(500).json(reback);
    })
})
function getDate(tm){
    var tt=new Date(parseInt(tm));
    tt.setHours(0);
    tt.setMinutes(0);
    tt.setSeconds(0);
    tt.setMilliseconds(0);
    return tt/1;
}
module.exports = router;

/**
 * Created by lichenchen on 2016/9/12.
 */
function BaiduTopContent(title, currentRank, firstCategory, secondCategory, searchVolume, trend, ctime) {
    this.title = title;
    this.currentRank = currentRank;
    this.firstCategory = firstCategory;
    this.secondCategory = secondCategory;
    this.searchVolume = searchVolume;
    this.trend = trend;
    this.ctime = ctime;
}
BaiduTopContent.prototype.constructor = BaiduTopContent;

BaiduTopContent.prototype.toString = function () {
    return JSON.stringify({
        title: this.title,
        currentRank: this.currentRank,
        firstCategory: this.firstCategory,
        secondCategory: this.secondCategory,
        searchVolume: this.searchVolume,
        trend: this.trend,
        ctime: this.ctime,
    });
};
BaiduTopContent.prototype.toJSON = function () {
    return JSON.stringify({
        title: this.title,
        currentRank: this.currentRank,
        firstCategory: this.firstCategory,
        secondCategory: this.secondCategory,
        searchVolume: this.searchVolume,
        trend: this.trend,
        ctime: this.ctime,
    });
};
BaiduTopContent.GetMongoDataModel = function (mongoose) {
    var dataModel = {};

    dataModel.mongoose = mongoose;

    dataModel.collectionName = 'baidu_top_content';
    dataModel.Schema = null;
    dataModel.Model = null;
    dataModel.save = null;

    if (dataModel.mongoose) {
        dataModel.Schema = new dataModel.mongoose.Schema({
            title: {type: String},
            currentRank: {type: Number},
            firstCategory: {type: Number},
            secondCategory: {type: Number},
            searchVolume: {type: Number},
            trend: {type: Number},
            ctime: {type: Number}
        }, {
            autoIndex: true,
        });

        var xform = function(doc, ret, options) {
            ret.createAt = ret._id.getTimestamp();
            delete ret._id;
        };
        dataModel.Schema.set('toJSON', { transform: xform });

        dataModel.Schema.index({ title: 1, firstCategory: 1, ctime: -1 }, { index: true });
        dataModel.Schema.index({ currentRank: 1, firstCategory: 1, ctime: -1 }, { unique: true });

        dataModel.Model = dataModel.mongoose.model(dataModel.collectionName, dataModel.Schema);

        dataModel.save = function (content, callback) {
            var doc = new dataModel.Model(content);
            doc.save(callback);
        }
    }

    return dataModel;
};
module.exports = BaiduTopContent;

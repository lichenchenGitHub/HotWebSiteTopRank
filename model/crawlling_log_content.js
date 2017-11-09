/**
 * Created by lichenchen on 2016/9/20.
 */
function CrawllingLogContent(website, listType, status, ctime) {
    this.website = website;
    this.listType = listType;
    this.status = status;
    this.ctime = ctime;
}
CrawllingLogContent.prototype.constructor = CrawllingLogContent;

CrawllingLogContent.prototype.toString = function () {
    return JSON.stringify({
        website: this.website,
        listType: this.listType,
        status: this.status,
        ctime: this.ctime,
    });
};
CrawllingLogContent.prototype.toJSON = function () {
    return JSON.stringify({
        website: this.website,
        listType: this.listType,
        status: this.status,
        ctime: this.ctime,
    });
};
CrawllingLogContent.GetMongoDataModel = function (mongoose) {
    var dataModel = {};

    dataModel.mongoose = mongoose;

    dataModel.collectionName = 'crawlling_log_content';
    dataModel.Schema = null;
    dataModel.Model = null;
    dataModel.save = null;

    if (dataModel.mongoose) {
        dataModel.Schema = new dataModel.mongoose.Schema({
            website: {type: String},
            listType: {type: String},
            status: {type: Boolean},
            ctime: {type: Number}
        }, {
            autoIndex: true,
        });
        dataModel.Schema.index({website: 1, listType: 1, ctime: -1}, {index: true});

        dataModel.Model = dataModel.mongoose.model(dataModel.collectionName, dataModel.Schema);

        dataModel.save = function (content, callback) {
            var doc = new dataModel.Model(content);
            doc.save(callback);
        }
    }

    return dataModel;
};
module.exports = CrawllingLogContent;

/**
 * Created by lichenchen on 2016/9/14.
 */
function YoukuContent(firstCategory, secondCategory, homepageurl, indexurl, title, avatar, person, channelid, kind, country, searchVolume, asubTrend, trend, currentRank, ctime) {
    this.title = title;
    this.currentRank = currentRank;
    this.firstCategory = firstCategory;
    this.secondCategory = secondCategory;
    this.searchVolume = searchVolume;
    this.trend = trend;
    this.homepageurl = homepageurl;
    this.indexurl = indexurl;
    this.avatar = avatar;
    this.person = person;
    this.channelid = channelid;
    this.kind = kind;
    this.country = country;
    this.asubTrend = asubTrend;
    this.ctime = ctime;

}
YoukuContent.prototype.constructor = YoukuContent;

YoukuContent.prototype.toString = function () {
    return JSON.stringify({
        title: this.title,
        currentRank: this.currentRank,
        firstCategory: this.firstCategory,
        secondCategory: this.secondCategory,
        searchVolume: this.searchVolume,
        trend: this.trend,
        homepageurl: this.homepageurl,
        indexurl: this.indexurl,
        avatar: this.avatar,
        person: this.person,
        channelid: this.channelid,
        kind: this.kind,
        country: this.country,
        asubTrend: this.asubTrend,
        ctime: this.ctime
    });
};
YoukuContent.prototype.toJSON = function () {
    return JSON.stringify({
        title: this.title,
        currentRank: this.currentRank,
        firstCategory: this.firstCategory,
        secondCategory: this.secondCategory,
        searchVolume: this.searchVolume,
        trend: this.trend,
        homepageurl: this.homepageurl,
        indexurl: this.indexurl,
        avatar: this.avatar,
        person: this.person,
        channelid: this.channelid,
        kind: this.kind,
        country: this.country,
        asubTrend: this.asubTrend,
        ctime: this.ctime
    });
};
YoukuContent.GetMongoDataModel = function (mongoose) {
    var dataModel = {};

    dataModel.mongoose = mongoose;

    dataModel.collectionName = 'youku_top_content';
    dataModel.Schema = null;
    dataModel.Model = null;
    dataModel.save = null;
    if (dataModel.mongoose) {
        var PersonItem = new dataModel.mongoose.Schema({ name: String, url: String });
        dataModel.Schema = new dataModel.mongoose.Schema({
            title: String,
            currentRank: Number,
            firstCategory: Number,
            secondCategory: Number,
            searchVolume: Number,
            trend: Number,
            homepageurl: String,
            indexurl: String,
            avatar: String,
            person: [PersonItem],
            channelid: String,
            kind: [String],
            country: [String],
            asubTrend: String,
            ctime: Number
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
module.exports = YoukuContent;

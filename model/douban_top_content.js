/**
 * Created by lichenchen on 2016/9/18.
 */
function DoubanTopContent(rate, cover_x, is_beetle_subject, title, url, playable, cover, id, cover_y, is_new, currentRank, ctime, firstCategory, secondCategory) {
    this.title = title;
    this.currentRank = currentRank;
    this.rate = rate;
    this.firstCategory = firstCategory;
    this.secondCategory = secondCategory;
    this.is_beetle_subject = is_beetle_subject;
    this.url = url;
    this.playable = playable;
    this.is_new = is_new;
    this.id = id;
    this.cover_x = cover_x;
    this.cover_y = cover_y;
    this.cover = cover;
    this.ctime = ctime;

}
DoubanTopContent.prototype.constructor = DoubanTopContent;

DoubanTopContent.prototype.toString = function () {
    return JSON.stringify({
        title: this.title,
        currentRank: this.currentRank,
        rate: this.rate,
        firstCategory: this.firstCategory,
        secondCategory: this.secondCategory,
        is_beetle_subject: this.is_beetle_subject,
        url: this.url,
        playable: this.playable,
        is_new: this.is_new,
        id: this.id,
        cover_x: this.cover_x,
        cover_y: this.cover_y,
        cover: this.cover,
        ctime: this.ctime
    });
};
DoubanTopContent.prototype.toJSON = function () {
    return JSON.stringify({
        title: this.title,
        currentRank: this.currentRank,
        rate: this.rate,
        firstCategory: this.firstCategory,
        secondCategory: this.secondCategory,
        is_beetle_subject: this.is_beetle_subject,
        url: this.url,
        playable: this.playable,
        is_new: this.is_new,
        id: this.id,
        cover_x: this.cover_x,
        cover_y: this.cover_y,
        cover: this.cover,
        ctime: this.ctime
    });
};
DoubanTopContent.GetMongoDataModel = function (mongoose) {
    var dataModel = {};

    dataModel.mongoose = mongoose;

    dataModel.collectionName = 'douban_top_content';
    dataModel.Schema = null;
    dataModel.Model = null;
    dataModel.save = null;
    if (dataModel.mongoose) {
        dataModel.Schema = new dataModel.mongoose.Schema({
            title: String,
            currentRank: Number,
            rate: Number,
            firstCategory: String,
            secondCategory: String,
            is_beetle_subject: Boolean,
            url: String,
            playable: Boolean,
            is_new: Boolean,
            id: String,
            cover_x: Number,
            cover_y: Number,
            cover: String,
            ctime: Number
        }, {
            autoIndex: true,
        });

        var xform = function(doc, ret, options) {
            ret.createAt = ret._id.getTimestamp();
            delete ret._id;
        };
        dataModel.Schema.set('toJSON', { transform: xform });

        dataModel.Schema.index({title: 1, firstCategory: 1, ctime: -1}, {index: true});
        dataModel.Schema.index({ currentRank: 1, firstCategory: 1, ctime: -1 }, { unique: true });

        dataModel.Model = dataModel.mongoose.model(dataModel.collectionName, dataModel.Schema);

        dataModel.save = function (content, callback) {
            var doc = new dataModel.Model(content);
            doc.save(callback);
        }
    }

    return dataModel;
};
module.exports = DoubanTopContent;

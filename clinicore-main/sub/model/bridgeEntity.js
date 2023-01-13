const mongoose = require("mongoose");

const brigeEntitySchema = new mongoose.Schema(
    {
        uniqCCId: {
            type: String,
            required: true,
            unique: true
        },
        uniqGHLId: {
            type: String,
            required: true,
            unique: true
        },
        type: {
            type: String,
            required: true,
        },
        source: {
            type: String,
            required: true,
            enum: ["CC", "GHL"]
        },
        createdByMigration: {
            type: Boolean,
            default: false,
        }
    },
    {
        timestamps: { createdAt: true, updatedAt: true },
    }
);


brigeEntitySchema.index({ uniqGHLId: 1, uniqCCId: 1 }, { unique: true });

brigeEntitySchema.statics.createbrigeEntity = function (brigeEntity) {
    return this.create(brigeEntity);
};

brigeEntitySchema.statics.getbrigeEntity = function (condition, options = {}) {
    return this.findOne(condition, options);
};

brigeEntitySchema.statics.getbrigeEntitys = function (
    condition,
    startIndex = 0,
    limit = 50,
    sort = {},
    options = {}
) {
    return this.find(condition, options)
        .limit(limit)
        .skip(startIndex)
        .sort(sort)
        .exec();
};

brigeEntitySchema.statics.countbrigeEntitys = function (condition) {
    return this.countDocuments(condition).exec();
};

brigeEntitySchema.statics.updatebrigeEntity = function (cond, update, options = {}) {
    return this.findOneAndUpdate(cond, update, options);
};

brigeEntitySchema.statics.deletebrigeEntity = function (condition) {
    return this.findOneAndDelete(condition).exec();
};

module.exports = mongoose.model("brigeEntity", brigeEntitySchema);

const mongoose = require("mongoose");

const ghlCredSchema = new mongoose.Schema(
    {
        clientId: {
            type: String,
            required: true,
            unique: true
        },
        accessToken: {
            type: String,
            required: true,
            unique: true
        },
        refreshToken: {
            type: String,
            required: true,
            unique: true
        },
        locationId: {
            type: String,
            required: true,
            unique: true
        }
    },
    {
        timestamps: { createdAt: true, updatedAt: true },
    }
);


// ghlCredSchema.index({ uniqGHLId: 1, uniqCCId: 1 }, { unique: true });

ghlCredSchema.statics.createGhlCred = function (credData) {
    return this.create(credData);
};

ghlCredSchema.statics.getGhlCred = function (condition, options = {}) {
    return this.findOne(condition, options);
};

// ghlCredSchema.statics.getbrigeEntitys = function (
//     condition,
//     startIndex = 0,
//     limit = 50,
//     sort = {},
//     options = {}
// ) {
//     return this.find(condition, options)
//         .limit(limit)
//         .skip(startIndex)
//         .sort(sort)
//         .exec();
// };

ghlCredSchema.statics.countGhlCredEntries = function (condition) {
    return this.countDocuments(condition).exec();
};

ghlCredSchema.statics.updateGhlCred = function (cond, update, options = {}) {
    return this.findOneAndUpdate(cond, update, options);
};

ghlCredSchema.statics.deleteGhlCred = function (condition) {
    return this.findOneAndDelete(condition).exec();
};

module.exports = mongoose.model("ghlCred", ghlCredSchema);
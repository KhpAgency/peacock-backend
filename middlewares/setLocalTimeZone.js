const moment = require("moment-timezone");

const applyTimestampsMiddleware = function (schema) {
  schema.pre("save", function (next) {
    const currentTime = moment().tz("Africa/Cairo").toDate();

    if (!this.createdAt) {
      this.createdAt = currentTime;
    }
    this.updatedAt = currentTime;

    next();
  });

  schema.pre("updateOne", function () {
    this.updateOne(
      {},
      { $set: { updatedAt: moment().tz("Africa/Cairo").toDate() } }
    );
  });
};

module.exports = applyTimestampsMiddleware;

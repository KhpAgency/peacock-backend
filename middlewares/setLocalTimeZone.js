const moment = require("moment-timezone");

exports.applyTimestampsMiddleware =  (schema) =>{
  schema.pre("save", function (next) {
    const currentTime = new Date();

    if (!this.createdAt) {
      this.createdAt = currentTime;
    }
    this.updatedAt = currentTime;

    next();
  });

  schema.pre("findOneAndUpdate", function (next) {
    this.set({ updatedAt: new Date() });
    next();
  });
};


const mongoose = require("mongoose");
const moment = require('moment-timezone');

module.exports = function applyTimestampsMiddleware(options) {
  return function middleware(next, model, options) {
    const timezone = options.get("timezone") || "UTC";

    const now = moment.now(timezone);

    model.update({}, {
      createdAt: now,
      updatedAt: now,
    }, {
      upsert: true,
    });

    await next();
  };
};
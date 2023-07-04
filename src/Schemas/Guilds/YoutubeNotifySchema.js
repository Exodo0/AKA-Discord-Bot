const mongoose = require("mongoose");

const youtubeNotifySchema = new mongoose.Schema({
  guild: {
    type: String,
    required: true,
    unique: true,
  },
  channelName: {
    type: String,
    required: true,
  },
  creatorID: {
    type: String,
    required: true,
  },
});

const YoutubeNotifySchema = mongoose.model(
  "YoutubeNotifySchema",
  youtubeNotifySchema
);

module.exports = YoutubeNotifySchema;

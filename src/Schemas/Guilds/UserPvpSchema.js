const mongoose = require("mongoose");

const pvpSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
    unique: true,
  },
  channelId: {
    type: String,
    required: true,
  },
  roleId: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Pvp", pvpSchema);

const mongoose = require("mongoose");

const AntiLinksSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  showMessage: { type: Boolean, required: true },
  channelId: { type: String, required: true },
  roleId: { type: String, required: true },
});

module.exports = mongoose.model("AntiLinks", AntiLinksSchema);

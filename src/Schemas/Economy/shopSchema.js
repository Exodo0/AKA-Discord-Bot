const { Schema, model } = require("mongoose");
const shopEconomySchema = new Schema({
  _id: Schema.Types.ObjectId,
  guildId: String,

  itemName: String,
  itemDescription: String,
  itemPrice: String,
  itemIdentifier: String,
  role: String,
  money: Number,
});

module.exports = model(
  "shopEconomySchema",
  shopEconomySchema,
  "guildShopEconomySchema"
);

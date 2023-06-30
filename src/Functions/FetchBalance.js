const { Types } = require("mongoose");
const userSchema = require("../Schemas/Economy/userEconomySchema");

module.exports = (client) => {
  client.fetchBalance = async (userId, guildId) => {
    let dbBalance = await userSchema.findOne({
      userId: userId,
      guildId: guildId,
    });

    if (!dbBalance) {
      dbBalance = await new userSchema({
        _id: new Types.ObjectId(),
        userId: userId,
        guildId: guildId,
      });

      await dbBalance.save().catch((err) => console.log(err));
      return dbBalance;
    }
    return dbBalance;
  };
};

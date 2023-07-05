const db = require("../Schemas/Embeds/EmbedSchema");

module.exports = {
  id: "CEsend",

  async execute(interaction, client) {
    const { guild, user } = interaction;
    // incrustaciones
    const embeds = interaction.message.embeds;

    // buscar documento
    let data = await db.findOne({ _id: guild.id });

    // buscar objeto de usuario
    let userObject = await data.users.find((u) => u.userId === user.id);

    const EMBED_CHANNEL = await client.channels.cache.get(
      userObject.sendChannel
    );

    async function fetch(channel, msg) {
      const message = await channel.messages.fetch(msg);
      return message;
    }

    if (userObject.messageId) {
      const message = await fetch(EMBED_CHANNEL, userObject.messageId);
      await message.edit({ embeds: [embeds[1]] });

      interaction.message.delete();
      interaction.reply({ content: "embed actualizado", ephemeral: true });

      delete userObject["sendChannel"];
      delete userObject["messageId"];
      delete userObject["interactionMessage"];
      delete userObject["interactionChannel"];
      data.markModified("users");
      await data.save();
    } else {
      const sendMessage = userObject.sendMessage;

      sendMessage
        ? await EMBED_CHANNEL.send({
            content: userObject.sendMessage,
            embeds: [embeds[1]],
          })
        : await EMBED_CHANNEL.send({ embeds: [embeds[1]] });

      interaction.message.delete();
      interaction.reply({ content: "embed enviado", ephemeral: true });

      delete userObject["sendChannel"];
      delete userObject["sendMessage"];
      delete userObject["interactionMessage"];
      delete userObject["interactionChannel"];

      data.markModified("users");
      await data.save();
    }
  },
};

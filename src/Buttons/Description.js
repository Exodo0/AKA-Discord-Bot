const { EmbedBuilder } = require("discord.js");
const { error, buttons, embeds: e } = require("../Utils/EmbedFuntions");

module.exports = {
  id: "CEdescription",

  async execute(interaction, client) {
    // embeds
    const embeds = interaction.message.embeds;
    let modifiedEmbed = embeds[1];

    // utilidades
    const remaining = 6000 - embeds[1].length;

    const descriptionEmbed = e.descriptionEmbed;

    interaction.message.edit({ embeds: [descriptionEmbed, embeds[1]] });

    let msgEmbed = new EmbedBuilder()
      .setColor("F4D58D")
      .setDescription("**Ingresa una descripción:**");
    interaction.reply({ embeds: [msgEmbed] });

    const filter = (m) => m.author.id === interaction.user.id;
    const collector = interaction.channel.createMessageCollector({
      filter,
    });

    buttons(client, interaction, collector);

    collector.on("collect", (m) => {
      if (m.content.length >= 4096) {
        return error(interaction, "**La descripción es demasiado larga**", m);
      }

      const description =
        m.content.length > remaining
          ? m.content.substring(0, remaining)
          : m.content;

      // ¿Es contenido JSON?
      let isJson = false;
      try {
        JSON.parse(description);
        isJson = true;
      } catch (e) {
        isJson = false;
      }

      if (isJson) {
        modifiedEmbed = EmbedBuilder.from(embeds[1]).setDescription(
          JSON.parse(description)
        );
        interaction.editReply({
          embeds: [msgEmbed.setDescription(`**Modificando descripción:**`)],
        });
      } else {
        modifiedEmbed = EmbedBuilder.from(embeds[1]).setDescription(
          `${description}`
        );
        interaction.editReply({
          embeds: [msgEmbed.setDescription(`**Modificando descripción:**`)],
        });
      }

      interaction.message
        .edit({
          embeds: [descriptionEmbed, modifiedEmbed],
        })
        .then(() => setTimeout(() => m.delete(), 1000));
    });
  },
};

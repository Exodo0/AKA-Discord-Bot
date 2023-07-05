const { EmbedBuilder } = require("discord.js");
const { error, buttons, embeds: e } = require("../Utils/EmbedFuntions");

module.exports = {
  id: "CEcolor",

  asyncexecute(interaction, client) {
    // embeds
    const embeds = interaction.message.embeds;
    let modifiedEmbed = embeds[1];

    const colorEmbed = e.colorEmbed;

    interaction.message.edit({
      embeds: [colorEmbed, embeds[1]],
    });

    let msgEmbed = new EmbedBuilder()
      .setColor("F4D58D")
      .setDescription("Ingresa un código de color HEX:");

    interaction.reply({ embeds: [msgEmbed] });

    // Crear colector de mensajes
    const filter = (m) => m.author.id === interaction.user.id;
    const collector = interaction.channel.createMessageCollector({
      filter,
    });

    let color = "";

    buttons(client, interaction, collector, "color");

    collector.on("collect", (m) => {
      if (!m.content.match(/[0-9A-Fa-f]{6}/g)) {
        return error(
          interaction,
          `\`${m.content}\` - código de color inválido`,
          m
        );
      }

      const hexToDecimal = (hex) => parseInt(hex, 16);

      if (hexToDecimal(m.content) > 16777215 || hexToDecimal(m.content) < 0) {
        return error(interaction, `\`${m.content}\`*- está fuera de rango`, m);
      }

      color = m.content;

      interaction.editReply({
        embeds: [
          EmbedBuilder.from(msgEmbed)
            .setDescription(`Color establecido como: \`${color}\``)
            .setColor(`${color}`),
        ],
      });

      modifiedEmbed = EmbedBuilder.from(embeds[1]).setColor(color);

      interaction.message
        .edit({
          embeds: [colorEmbed, modifiedEmbed],
        })
        .then(() => setTimeout(() => m.delete(), 1000));
    });
  },
};

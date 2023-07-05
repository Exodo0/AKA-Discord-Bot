const { EmbedBuilder } = require("discord.js");
const { error, buttons, embeds: e } = require("../Utils/EmbedFuntions");

module.exports = {
  id: "CEfields_delete",

  async execute(interaction, client) {
    // embeds
    const embeds = interaction.message.embeds;
    let modifiedEmbed = EmbedBuilder.from(embeds[1]);
    if (!modifiedEmbed.data.fields) {
      return error(interaction, "No hay campos para eliminar");
    }

    // utilidades

    const FieldEmbed = e.fieldEmbed;

    const filter = (m) => m.author.id === interaction.user.id;
    const collector = interaction.channel.createMessageCollector({
      filter,
    });

    buttons(client, interaction, collector, "delete");

    let msgEmbed = new EmbedBuilder().setColor("F4D58D");

    interaction.reply({
      embeds: [
        msgEmbed.setDescription("Ingresa el número de índice del campo:"),
      ],
    });

    collector.on("collect", (m) => {
      let index = parseInt(m.content);

      if (isNaN(index)) {
        return error(interaction, "El índice debe ser un número", m);
      }
      if (index > 25 || index < 0) {
        return error(
          interaction,
          "El número de índice debe estar entre 0 y 25",
          m
        );
      }
      if (!modifiedEmbed.data.fields[index]) {
        return error(interaction, `El índice ${index} no existe`, m);
      }

      interaction.editReply({
        embeds: [msgEmbed.setDescription(`¡Campo \`${index}\` eliminado!`)],
      });

      interaction.message
        .edit({
          embeds: [FieldEmbed, modifiedEmbed.spliceFields(index, 1)],
        })
        .then(() => setTimeout(() => m.delete(), 1000));
    });
  },
};

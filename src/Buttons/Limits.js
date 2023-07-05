const { EmbedBuilder } = require("discord.js");
const { error, buttons, embeds: e } = require("../Utils/EmbedFuntions");

module.exports = {
  id: "CElimits",

  async execute(interaction, client) {
    // incrustaciones
    const embeds = interaction.message.embeds;
    // utilidades
    const remaining = 6000 - embeds[1].length;
    const title = 256 - embeds[1].data.title?.length || 256;
    const description = 4096 - embeds[1].data?.description.length || 4096;
    const footer = 1024 - embeds[1].data.footer?.text.length || 1024;
    const author = 256 - embeds[1].data.author?.name.length || 256;
    const fields = 25 - embeds[1].data.fields?.length || 25;

    const LimitsEmbed = new EmbedBuilder()
      .setTitle("Límites del Embed")
      .setColor("F4D58D")
      .setFields([
        {
          name: "Título",
          value: `**Restantes:** \`${title}\\256\``,
          inline: true,
        },
        {
          name: "Descripción",
          value: `**Restantes:** \`${description}\\4096\``,
          inline: true,
        },
        {
          name: "Campos",
          value: `**Restantes:** \`${fields}\\25\``,
          inline: true,
        },
        {
          name: "Pie de página",
          value: `**Restantes:** \`${footer}\\1024\``,
          inline: true,
        },
        {
          name: "Autor",
          value: `**Restantes:** \`${author}\\256\``,
          inline: true,
        },
        {
          name: "Total",
          value: `**Restantes:** \`${remaining}\\6000\``,
          inline: true,
        },
      ]);

    interaction.deferUpdate();

    interaction.message.edit({ embeds: [LimitsEmbed, embeds[1]] });

    buttons(client, interaction);
  },
};

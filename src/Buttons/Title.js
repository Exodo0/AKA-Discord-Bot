const { EmbedBuilder } = require("discord.js");
const { error, buttons, embeds: e } = require("../Utils/EmbedFuntions");

module.exports = {
  id: "CEtitle",

  async execute(interaction, client) {
    // incrustaciones
    const embeds = interaction.message.embeds;
    let modifiedEmbed = embeds[1];
    // utilidades
    const remaining = 6000 - embeds[1].length;

    const titleEmbed = e.titleEmbed;

    interaction.message.edit({ embeds: [titleEmbed, embeds[1]] });

    let msgEmbed = new EmbedBuilder()
      .setColor("F4D58D")
      .setDescription("**Ingresa un título:**");
    interaction.reply({ embeds: [msgEmbed] });

    const filter = (m) => m.author.id === interaction.user.id;
    const collector = interaction.channel.createMessageCollector({
      filter,
    });

    buttons(client, interaction, collector);

    collector.on("collect", (m) => {
      if (m.content.length >= 256) {
        return error(interaction, "El título es demasiado largo", m);
      }

      const title =
        m.content.length > remaining
          ? m.content.substring(0, remaining)
          : m.content;

      // ¿el contenido es JSON?
      let isJson = false;
      try {
        JSON.parse(title);
        isJson = true;
      } catch (e) {
        isJson = false;
      }

      if (isJson) {
        modifiedEmbed = EmbedBuilder.from(embeds[1]).setTitle(
          JSON.parse(title)
        );
        interaction.editReply({
          embeds: [
            msgEmbed.setDescription(
              `**Título establecido como:** \`${JSON.parse(title)}\``
            ),
          ],
        });
      } else {
        modifiedEmbed = EmbedBuilder.from(embeds[1]).setTitle(title);

        interaction.editReply({
          embeds: [
            msgEmbed.setDescription(
              `**Título establecido como:** \`${title}\``
            ),
          ],
        });
      }

      interaction.message
        .edit({
          embeds: [titleEmbed, modifiedEmbed],
        })
        .then(() => setTimeout(() => m.delete(), 1000));
    });
  },
};

const { EmbedBuilder } = require("discord.js");
const { error, buttons, embeds: e } = require("../Utils/EmbedFuntions");

module.exports = {
  id: "CEauthor",

  async execute(interaction, client) {
    // Embeds
    const embeds = interaction.message.embeds;
    let modifiedEmbed = embeds[1];

    const authorEmbed = e.authorEmbed;

    interaction.message.edit({
      embeds: [authorEmbed, embeds[1]],
    });

    let msgEmbed = new EmbedBuilder()
      .setColor("F4D58D")
      .setDescription("Menciona a un usuario o envía un mensaje:");

    interaction.reply({ embeds: [msgEmbed] });

    // Crear un recolector de mensajes
    const filter = (m) => m.author.id === interaction.user.id;
    const collector = interaction.channel.createMessageCollector({
      filter,
    });

    buttons(client, interaction, collector, "author");

    collector.on("collect", (m) => {
      if (m.content.length >= 256) {
        return error(interaction, "**El autor es demasiado largo**", m);
      }

      // El autor es la primera mención o el contenido del mensaje
      let author = m.mentions.users.first()
        ? m.mentions.users.first()
        : m.content;

      interaction.editReply({
        embeds: [
          EmbedBuilder.from(msgEmbed).setDescription(
            `Autor establecido como: ${author}`
          ),
        ],
      });

      modifiedEmbed = EmbedBuilder.from(embeds[1]);

      if (m.mentions.users.first()) {
        modifiedEmbed.setAuthor({
          name: author.username,
          iconURL: author.displayAvatarURL({
            dynamic: true,
            size: 512,
          }),
        });
      } else {
        modifiedEmbed.setAuthor({ name: author });
      }

      interaction.message
        .edit({
          embeds: [authorEmbed, modifiedEmbed],
        })
        .then(() => setTimeout(() => m.delete(), 1000));
    });
  },
};

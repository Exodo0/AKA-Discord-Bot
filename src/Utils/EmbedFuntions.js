const {
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
} = require("discord.js");

const embeds = {
  colorEmbed: new EmbedBuilder()
    .setColor("F4D58D")
    .setTitle(`Editando color`)
    .setDescription(
      `**Para establecerlo:** \`envía un código de color hexadecimal en el chat\``
    ),
  titleEmbed: new EmbedBuilder()
    .setColor("F4D58D")
    .setTitle(`Editando título`)
    .setDescription(`**Para establecerlo:** \`envía un mensaje en el chat\``),
  urlEmbed: new EmbedBuilder()
    .setColor("F4D58D")
    .setTitle(`Editando URL`)
    .setDescription(`**Para establecerlo:** \`envía una URL en el chat\``),
  authorEmbed: new EmbedBuilder()
    .setColor("F4D58D")
    .setTitle(`Editando autor`)
    .setDescription(`**Para establecerlo:** \`menciona a un usuario\``),
  descriptionEmbed: new EmbedBuilder()
    .setColor("F4D58D")
    .setTitle(`Editando descripción`)
    .setDescription(`**Para establecerla:** \`envía un mensaje en el chat\``),
  thumbnailEmbed: new EmbedBuilder()
    .setColor("F4D58D")
    .setTitle(`Editando miniatura`)
    .setDescription(
      `**Para establecerla:** \`envía un enlace de imagen [DIRECT] en el chat\``
    ),
  imageEmbed: new EmbedBuilder()
    .setColor("F4D58D")
    .setTitle(`Editando imagen`)
    .setDescription(
      `**Para establecerla:** \`envía un enlace de imagen [DIRECT] en el chat\``
    ),
  footerEmbed: new EmbedBuilder()
    .setColor("F4D58D")
    .setTitle(`Editando pie de página`)
    .setDescription(`**Para establecerlo:** \`envía un mensaje en el chat\``),
  fieldEmbed: new EmbedBuilder()
    .setColor("F4D58D")
    .setTitle(`Eliminando campos`)
    .setDescription(
      `**Para eliminar:** \`escribe el número de índice en el chat"\``
    ),
  jsonEmbed: new EmbedBuilder()
    .setColor("F4D58D")
    .setTitle(`Seleccionando JSON`)
    .setDescription(`**Selecciona:** \`desde el menú desplegable\``),
};

module.exports.error = function (interaction, error, message = null) {
  const embed = new EmbedBuilder()
    .setColor("DarkRed")
    .setDescription(`**${error}**`);

  return message
    ? interaction
        .editReply({ embeds: [embed] })
        .then(() => setTimeout(() => message.delete(), 1000))
    : interaction.reply({ embeds: [embed], ephemeral: true });
};

module.exports.buttons = function (
  client,
  interaction,
  collector = null,
  type = null
) {
  const { colorEmbed, authorEmbed, fieldEmbed } = embeds;
  const { guild } = interaction;
  // Embeds
  const baseEmbeds = interaction.message.embeds;
  let modifiedEmbed = baseEmbeds[1];
  let msgEmbed = new EmbedBuilder().setColor("F4D58D");

  // Componentes
  const rows = interaction.message.components;

  // Definir botones
  const cancel_button = new ButtonBuilder()
    .setCustomId("cancel")
    .setStyle(ButtonStyle.Secondary)
    .setLabel("Cancelar");
  const random_button = new ButtonBuilder()
    .setCustomId("random")
    .setStyle(ButtonStyle.Secondary)
    .setLabel("Aleatorio");
  const bot_button = new ButtonBuilder()
    .setCustomId("bot")
    .setStyle(ButtonStyle.Secondary)
    .setLabel("Bot");
  const guild_button = new ButtonBuilder()
    .setCustomId("guild")
    .setStyle(ButtonStyle.Secondary)
    .setLabel("Servidor");
  const index_button = new ButtonBuilder()
    .setCustomId("sindex")
    .setStyle(ButtonStyle.Secondary)
    .setLabel("Mostrar Índice");

  // Botones utilitarios
  let buttonRow = new ActionRowBuilder().addComponents(cancel_button);

  switch (type) {
    case null:
      editMessage();
      break;
    case "color":
      buttonRow.addComponents(random_button);
      editMessage();
      break;
    case "author":
      buttonRow.addComponents(bot_button, guild_button);
      editMessage();
      break;
    case "delete":
      buttonRow.addComponents(index_button);
      editMessage();
      break;
  }

  const buttonFilter = (u) => u.user.id === interaction.user.id;
  buttonCollector = interaction.message.createMessageComponentCollector({
    filter: buttonFilter,
  });

  // Envolver en una función
  function editMessage() {
    interaction.message.edit({
      components: [buttonRow],
    });
  }

  let num = 0;

  // Función para mostrar el índice de los campos
  async function showIndex(embed0, embed1) {
    const data = embed1.data.fields.map((field) => {
      return {
        name: `\`${num++}\`` + " " + field.name,
        value: field.value,
        inline: field.inline,
      };
    });
    embed1 = EmbedBuilder.from(embed1).setFields(data);
    await interaction.message.edit({ embeds: [embed0, embed1] });
    num = 0;
  }

  buttonCollector.on("collect", (btnInt) => {
    // Si se presiona el botón de cancelar
    if (btnInt.component.customId === "cancel") {
      btnInt.deferUpdate();

      interaction.message
        .edit({
          embeds: [baseEmbeds[0], interaction.message.embeds[1]],
          components: rows,
        }) // Si la interacción ha sido respondida, eliminar la respuesta
        .then(() => {
          if (interaction.replied) {
            interaction.deleteReply();
          }
        });

      buttonCollector.stop();
      collector?.stop();
    }

    // Si se presiona el botón de aleatorio
    if (btnInt.component.customId === "random") {
      btnInt.deferUpdate();

      let letters = "0123456789ABCDEF";
      let color = "#";
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }

      modifiedEmbed = EmbedBuilder.from(baseEmbeds[1]).setColor(color);

      interaction.message.edit({
        embeds: [colorEmbed, modifiedEmbed],
      });
      interaction.editReply({
        embeds: [
          EmbedBuilder.from(msgEmbed)
            .setDescription(`Color establecido como: \`${color}\``)
            .setColor(`${color}`),
        ],
      });
    }

    // Si se presiona el botón de bot
    if (btnInt.component.customId === "bot") {
      btnInt.deferUpdate();

      author = {
        name: `${client.user.username}`,
        iconURL: client.user.displayAvatarURL({
          dynamic: true,
          size: 512,
        }),
      };

      modifiedEmbed = EmbedBuilder.from(baseEmbeds[1]).setAuthor(author);

      interaction.message.edit({
        embeds: [authorEmbed, modifiedEmbed],
      });
      interaction.editReply({
        embeds: [
          EmbedBuilder.from(msgEmbed).setDescription(
            `Autor establecido como: \`${author.name}\``
          ),
        ],
      });
    }

    // Si se presiona el botón de servidor
    if (btnInt.component.customId === "guild") {
      btnInt.deferUpdate();

      author = {
        name: `${guild.name}`,
        iconURL: guild.iconURL({
          dynamic: true,
          size: 512,
        }),
      };

      modifiedEmbed = EmbedBuilder.from(baseEmbeds[1]).setAuthor(author);

      interaction.message.edit({
        embeds: [authorEmbed, modifiedEmbed],
      });
      interaction.editReply({
        embeds: [
          EmbedBuilder.from(msgEmbed).setDescription(
            `Autor establecido como: \`${author.name}\``
          ),
        ],
      });
    }
    // Si se presiona el botón de índice
    if (btnInt.component.customId === "sindex") {
      btnInt.deferUpdate();
      return showIndex(fieldEmbed, interaction.message.embeds[1]);
    }
  });
};

module.exports.embeds = embeds;

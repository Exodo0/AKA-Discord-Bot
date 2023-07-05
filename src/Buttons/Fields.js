const {
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
} = require("discord.js");
const { Promise } = require("mongoose");

const { error } = require("../Utils/EmbedFuntions");

module.exports = {
  id: "CEfields",

  async execute(interaction, client) {
    // embeds
    const embeds = interaction.message.embeds;
    let modifiedEmbed = EmbedBuilder.from(embeds[1]);

    // componentes
    const rows = interaction.message.components;

    let modifying = "name";
    let newField = { name: "\u200b", value: "\u200b" };

    let fieldEmbed = new EmbedBuilder()
      .setTitle(`Editando campos`)
      .setColor("F4D58D")
      .setDescription(
        `
       **Usa los botones de abajo para establecer los datos del campo**
       **Haz clic en \`set\` para aplicar**
       **Hacer clic en el botón \`set\` sin tener un nombre o un valor insertará un espacio en blanco {character}**
    `
      )
      .addFields(
        { name: `nombre`, value: `\u200b`, inline: false },
        { name: `valor`, value: `\u200b`, inline: false },
        { name: `en línea`, value: `\u200b`, inline: false }
      );

    interaction.message.edit({
      embeds: [fieldEmbed, embeds[1]],
    });

    let msgEmbed = new EmbedBuilder()
      .setColor("F4D58D")
      .setDescription(`**configurando \`${modifying}\`:**`);
    interaction.reply({
      embeds: [msgEmbed],
    });

    const filter = (m) => m.author.id === interaction.user.id;
    const collector = interaction.channel.createMessageCollector({
      filter,
    });

    // botones utilitarios --------------------------------------------------------------
    const buttonRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("cancel")
        .setStyle(ButtonStyle.Secondary)
        .setLabel("cancelar"),
      new ButtonBuilder()
        .setCustomId("name")
        .setStyle(ButtonStyle.Secondary)
        .setLabel("nombre"),
      new ButtonBuilder()
        .setCustomId("value")
        .setStyle(ButtonStyle.Secondary)
        .setLabel("valor"),
      new ButtonBuilder()
        .setCustomId("inline")
        .setStyle(ButtonStyle.Secondary)
        .setLabel("en línea"),
      new ButtonBuilder()
        .setCustomId("set")
        .setStyle(ButtonStyle.Secondary)
        .setLabel("establecer")
    );

    const buttonFilter = (u) => u.user.id === interaction.user.id;
    buttonCollector = interaction.message.createMessageComponentCollector({
      filter: buttonFilter,
    });

    interaction.message.edit({
      components: [buttonRow],
    });

    buttonCollector.on("collect", (btnInt) => {
      let fields = fieldEmbed.data.fields;

      if (btnInt.component.customId === "cancel") {
        btnInt.deferUpdate();
        buttonCollector.stop();
        collector.stop();
      }
      if (btnInt.component.customId === "name") {
        btnInt.deferUpdate();
        modifying = "nombre";

        interaction.editReply({
          embeds: [
            EmbedBuilder.from(msgEmbed).setDescription(
              `**modificando \`${modifying}\`:**`
            ),
          ],
        });
      }
      if (btnInt.component.customId === "value") {
        btnInt.deferUpdate();
        modifying = "valor";

        interaction.editReply({
          embeds: [
            EmbedBuilder.from(msgEmbed).setDescription(
              `**modificando \`${modifying}\`:**`
            ),
          ],
        });
      }
      if (btnInt.component.customId === "inline") {
        btnInt.deferUpdate();
        modifying = "en línea";

        // cambiar en línea
        if (newField.inline === true) {
          newField.inline = false;
        } else {
          newField.inline = true;
        }

        // editar el tercer campo en el embed
        fieldEmbed = EmbedBuilder.from(fieldEmbed).setFields(
          fields[0],
          fields[1],
          {
            name: `en línea`,
            value: `${newField.inline}`,
          }
        );

        interaction.message.edit({
          embeds: [fieldEmbed, modifiedEmbed],
        });

        interaction.editReply({
          embeds: [
            EmbedBuilder.from(msgEmbed).setDescription(
              `**\`${modifying}\`: ${newField.inline}**`
            ),
          ],
        });
      }
      if (btnInt.component.customId === "set") {
        btnInt.deferUpdate();

        let fields = modifiedEmbed.data.fields;
        if (!fields) {
          fields = [];
        }

        // verificar que la longitud de los campos sea mayor a 25

        if (fields.length >= 25) {
          return interaction.editReply({
            embeds: [
              EmbedBuilder.from(msgEmbed)
                .setColor("DarkRed")
                .setDescription(
                  `**Se ha alcanzado el número máximo de campos**`
                ),
            ],
          });
        }

        fieldEmbed = EmbedBuilder.from(fieldEmbed).setFields(
          { name: `nombre`, value: `\u200b`, inline: false },
          { name: `valor`, value: `\u200b`, inline: false },
          { name: `en línea`, value: `\u200b`, inline: false }
        );

        modifiedEmbed = EmbedBuilder.from(modifiedEmbed).addFields(newField);

        newField = { name: "\u200b", value: "\u200b" };

        interaction.message.edit({
          embeds: [fieldEmbed, modifiedEmbed],
        });
        newField;
        interaction.editReply({
          embeds: [
            EmbedBuilder.from(msgEmbed).setDescription(`**Añadido: ✅ **`),
          ],
        });
      }
    });

    collector.on("collect", (m) => {
      let fields = fieldEmbed.data.fields;

      // verificar el valor de modifying
      if (modifying === "nombre") {
        // verificar que la longitud del nombre sea menor a 256
        if (m.content.length > 256)
          return error(interaction, "el nombre es demasiado largo", m);

        newField.name = m.content;

        fieldEmbed = EmbedBuilder.from(fieldEmbed).setFields(
          { name: `nombre`, value: `establecido ✅` },
          fields[1],
          fields[2]
        );

        interaction.message.edit({
          embeds: [fieldEmbed, modifiedEmbed],
        });

        interaction.editReply({
          embeds: [
            EmbedBuilder.from(msgEmbed).setDescription(
              `**modificando \`${modifying}\`: ✅**`
            ),
          ],
        });
      }
      if (modifying === "valor") {
        // verificar que la longitud del valor sea menor a 1024
        if (m.content.length > 1024)
          return error(interaction, "el valor es demasiado largo", m);
        newField.value = m.content;

        fieldEmbed = EmbedBuilder.from(fieldEmbed).setFields(
          fields[0],
          { name: `valor`, value: `establecido ✅` },
          fields[2]
        );

        interaction.message.edit({
          embeds: [fieldEmbed, modifiedEmbed],
        });

        interaction.editReply({
          embeds: [
            EmbedBuilder.from(msgEmbed).setDescription(
              `**modificando \`${modifying}\`: ✅**`
            ),
          ],
        });
      }

      new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve();
        }, 1000);
      }).then(() => m.delete());
    });

    collector.on("end", () => {
      interaction.message
        .edit({
          embeds: [embeds[0], modifiedEmbed],
          components: rows,
        })
        .then(interaction.deleteReply());
      return;
    });
  },
};

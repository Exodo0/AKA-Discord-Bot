const {
  ChatInputCommandInteraction,
  Client,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  EmbedBuilder,
} = require("discord.js");
const userAppSchema = require("../../Schemas/Guilds/userAppSchema");
const appSchema = require("../../Schemas/Guilds/appschema");
const { Types } = require("mongoose");
module.exports = {
  name: "interactionCreate",
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    if (!interaction.isModalSubmit()) return;
    if (interaction.customId !== "application-modal")
      return console.log("Modal ID invalido");
    const data = await appSchema.findOne({ guildId: interaction.guild.id });

    if (!data)
      return interaction.reply(
        "Al parecer no tienen el sistema de aplicaciones configurado. llama a un admin para que lo arregle"
      );
    if (!data.channelId)
      return interaction.reply(
        "!Ups! El canal de las aplicaciones no lo encuentro."
      );

    const channel = interaction.guild.channels.cache.get(data.channelId);

    const reason = interaction.fields.getTextInputValue("reason");
    const age = interaction.fields.getTextInputValue("age");
    const name =
      interaction.fields.getTextInputValue("name") || "No ingresado.";
    const pronouns =
      interaction.fields.getTextInputValue("pronouns") || "No ingresado.";
    const location =
      interaction.fields.getTextInputValue("location") || "No ingresado.";

    await new userAppSchema({
      _id: new Types.ObjectId(),
      guildId: interaction.guild.id,
      userId: interaction.user.id,
      reason: reason,
      age: age,
      name: name,
      pronouns: pronouns,
      location: location,
    })
      .save()
      .then(async (schema) => {
        const embed = new EmbedBuilder()
          .setTitle(`Nueva Aplicacion de: ${interaction.guild.name}`)
          .setDescription(`**ID del Formulario:** ${schema._id}`)
          .addFields(
            {
              name: "Usuario:",
              value: `<@${interaction.user.id}>`,
              inline: true,
            },
            {
              name: "Razon:",
              value: `\`\`\`${reason}\`\`\``,
              inline: true,
            },
            {
              name: "Edad:",
              value: `${age}`,
              inline: true,
            },
            {
              name: "Nombre:",
              value: `${name}`,
              inline: true,
            },
            {
              name: "Pronombre",
              value: `${pronouns}`,
              inline: true,
            },
            {
              name: "Pais:",
              value: `${location}`,
              inline: true,
            }
          )
          .setFooter({ text: `ID del Usuario: ${interaction.user.id}` })
          .setTimestamp();

        await channel.send({ embeds: [embed] });

        return await interaction.reply({
          content:
            "Tu formulario fue enviado. Espera pacientemente una respuesta",
          ephemeral: true,
        });
      });
  },
};

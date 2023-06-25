const {
  ChatInputCommandInteraction,
  Client,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
const appSchema = require("../../Schemas/Guilds/appschema");
const userSchema = require("../../Schemas/Guilds/userAppSchema");
module.exports = {
  name: "interactionCreate",
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    if (!interaction.isButton()) return;
    const { customId } = interaction;
    if (customId !== "apply") return;

    const data = await userSchema.findOne({ guildId: interaction.guildId });
    if (data && data.userId === interaction.user.id)
      return interaction.reply({
        content:
          "Disculpa pero tenemos agregado una postulacion tuya. Espera una respuesta dentro de poco.",
        ephemeral: true,
      });

    const modal = new ModalBuilder()
      .setCustomId("application-modal")
      .setTitle(`Formulario del servidor!`);

    const reasonInput = new TextInputBuilder()
      .setCustomId("reason")
      .setPlaceholder("Cuentanos ¿Porque quieres unirte?")
      .setMinLength(10)
      .setMaxLength(1000)
      .setRequired(true)
      .setLabel("Ingresa tus razones.")
      .setStyle(TextInputStyle.Paragraph);
    const ageInput = new TextInputBuilder()
      .setLabel("Edad")
      .setCustomId("age")
      .setPlaceholder("Cuantos años tienes?")
      .setMinLength(1)
      .setMaxLength(3)
      .setRequired(true)
      .setStyle(TextInputStyle.Short);
    const nameInput = new TextInputBuilder()
      .setLabel("Nombre")
      .setCustomId("name")
      .setPlaceholder("Cual es tu nombre? (opcional)")
      .setMaxLength(100)
      .setRequired(false)
      .setStyle(TextInputStyle.Short);
    const pronounsInput = new TextInputBuilder()
      .setLabel("Pronombres")
      .setCustomId("pronouns")
      .setPlaceholder("Cual es tu apodo? (opcional)")
      .setMaxLength(100)
      .setRequired(false)
      .setStyle(TextInputStyle.Short);
    const locationInput = new TextInputBuilder()
      .setLabel("Pais")
      .setCustomId("location")
      .setRequired(false)
      .setPlaceholder("De que pais perteneces? (opcional)")
      .setMaxLength(100)
      .setStyle(TextInputStyle.Short);

    const reason = new ActionRowBuilder().addComponents(reasonInput);
    const age = new ActionRowBuilder().addComponents(ageInput);
    const name = new ActionRowBuilder().addComponents(nameInput);
    const pronouns = new ActionRowBuilder().addComponents(pronounsInput);
    const location = new ActionRowBuilder().addComponents(locationInput);

    modal.addComponents(reason, age, name, pronouns, location);

    await interaction.showModal(modal);
  },
};

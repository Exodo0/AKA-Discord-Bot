const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
} = require("discord.js");

const AntiLinks = require("../../Schemas/Guilds/AntiLinksSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("anti-links")
    .setDescription("⚙️ Configura el Sistema Anti-Links. (Beta)")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((subCommand) => {
      return subCommand
        .setName("setup")
        .setDescription("⚙️ Empezemos a configurar tu Sistema Anti-Links.")
        .addBooleanOption((options) =>
          options
            .setName("message")
            .setDescription(
              "➕ Alterna si se muestra un mensaje cuando se detecta un link."
            )
            .setRequired(true)
        )
        .addChannelOption((options) =>
          options
            .setName("channel")
            .setDescription(
              "📝 Selecciona el canal donde mandare un registro detallado de los links."
            )
            .setRequired(true)
        )
        .addRoleOption((options) =>
          options
            .setName("role")
            .setDescription(
              "📝 Selecciona el rol para mutear a los usuarios que envien links."
            )
            .setRequired(true)
        );
    })
    .addSubcommand((subCommand) => {
      return subCommand
        .setName("delete")
        .setDescription("⚙️ Borra el Sistema Anti-Links");
    }),

  /**
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   */

  async execute(interaction, client) {
    switch (interaction.options.getSubcommand()) {
      case "setup":
        const showMessage = interaction.options.getBoolean("message");
        const channel = interaction.options.getChannel("channel");
        const role = interaction.options.getRole("role");

        const antiLinks = new AntiLinks({
          guildId: interaction.guildId,
          showMessage: showMessage,
          channelId: channel.id,
          roleId: role.id,
        });

        await antiLinks.save();

        return interaction.reply({
          content: "🛠 Sistema Anti-Links Configurado.",
          ephemeral: true,
        });

      case "delete":
        await AntiLinks.findOneAndDelete({
          guildId: interaction.guildId,
        });

        return interaction.reply({
          content:
            "🛠 Sistema Anti-Links Borrado. Considera volver a configurarlo.",
          ephemeral: true,
        });
    }
  },
};

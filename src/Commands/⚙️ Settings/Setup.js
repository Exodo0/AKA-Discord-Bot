const { PvPSchema } = require("../../Schemas/Guilds/Chpvp");
const {
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
  ChannelType,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup")
    .setDescription("⚙ Configura un entorno de PVP aleatorizado")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("anuncios")
        .setDescription("📑 ¿Dónde enviaré la lista diaria de usuarios?")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("El canal donde se enviará la lista")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("duration")
        .setDescription(
          "⌛ Configura el tiempo que los usuarios tienen para aceptar"
        )
        .addStringOption((option) =>
          option
            .setName("time")
            .setDescription(
              "⌛ Puedes ingresar '3M' para 3 minutos o '12H' para 12 horas"
            )
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("delete")
        .setDescription("🗑 Elimina el sistema de PVP configurado")
    ),

  async execute(client, interaction) {
    switch (interaction.options.getSubcommand()) {
      case "anuncios":
        const channel = interaction.options.getChannel("channel");

        const pvpSchemaAnuncios = new PvPSchema({
          guildId: interaction.guildId,
          channel: channel.id,
          mod: interaction.user.username,
        });
        await pvpSchemaAnuncios.save();

        const anunciosEmbed = new EmbedBuilder()
          .setTitle("🔵 Configuración exitosa")
          .setDescription(
            `Se enviará la lista diaria de usuarios al canal ${channel}`
          )
          .addField("Moderador", interaction.user.username)
          .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
          .setFooter({
            text: "Recuerda que solo se seleccionarán a 10 usuarios al azar",
            iconURL: interaction.user.avatarURL({ dynamic: true }),
          });

        await interaction.reply({ embeds: [anunciosEmbed] });
        break;

      case "duration":
        const timeInput = interaction.options.getString("time");
        const validTimes = ["3M", "12H"];

        if (!validTimes.includes(timeInput)) {
          return await interaction.reply({
            content:
              "⚠️ El tiempo especificado no es válido. Debes ingresar '3M' o '12H'.",
            ephemeral: true,
          });
        }

        const pvpSchemaDuration = new PvPSchema({
          guildId: interaction.guildId,
          channel: interaction.channel.id,
          mod: interaction.user.username,
          duration: timeInput,
        });
        await pvpSchemaDuration.save();

        await interaction.reply({
          content: `🔵 ¡Hecho! Ahora el tiempo para aceptar un PVP es de ${timeInput}`,
          ephemeral: true,
        });
        break;

      case "delete":
        const deletedPvP = await PvPSchema.findOneAndDelete({
          guildId: interaction.guildId,
        });

        if (!deletedPvP) {
          return await interaction.reply({
            content: "🔴 No se encontró ningún sistema de PVP configurado.",
            ephemeral: true,
          });
        }

        await interaction.reply({
          content: "⚙️ Sistema de PVP eliminado correctamente.",
          ephemeral: true,
        });
        break;
    }
  },
};

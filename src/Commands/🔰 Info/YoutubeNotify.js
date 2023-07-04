const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
  TextChannel,
} = require("discord.js");
const YoutubeSchema = require("../../Schemas/Guilds/YoutubeNotifySchema");
const { google } = require("googleapis");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("youtube")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDescription(
      "🛠 Configura el canal donde enviaré las notificaciones de tus nuevos videos o de otro canal."
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("setup")
        .setDescription("🔎 Comencemos a configurar este sistema de anuncios.")
        .addChannelOption((options) =>
          options
            .setName("channel")
            .setDescription("🗒 ¿En qué canal enviaré las notificaciones?")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
        .addStringOption((options) =>
          options
            .setName("name")
            .setDescription(
              "Agrega el nombre del canal de YouTube del cual quieres ser notificado cuando suba algo nuevo."
            )
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("delete")
        .setDescription("🗑 Elimina la configuración actual de notificaciones.")
    ),

  /**
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    const { options, guild } = interaction;

    switch (options.getSubcommand()) {
      case "setup":
        const channel = interaction.options.getChannel("channel");
        const name = interaction.options.getString("name");

        const channelDB = await YoutubeSchema.findOne({ guild: guild.id });

        if (channelDB) {
          const Exist = new EmbedBuilder()
            .setTitle("⭕️ Tenemos un Problema.")
            .setColor("Red")
            .setFields(
              {
                name: "💠 El canal ya fue previamente configurado.",
                value: `Se encuentra en: <#${channelDB.channel}>`,
              },
              {
                name: "💠 Si quieres cambiarlo, tendrás que eliminarlo y volver a configurarlo usando:",
                value: "`/youtube delete`",
              }
            );
          return interaction.reply({
            embeds: [Exist],
            ephemeral: true,
          });
        }

        // Guardar la configuración en la base de datos
        const newChannel = new YoutubeSchema({
          guild: guild.id,
          channelName: name,
          creatorID: channel.id,
        });
        await newChannel.save();

        const Completed = new EmbedBuilder()
          .setColor("Green")
          .setTitle("✅ Configuración completada.")
          .setDescription(
            "Se enviarán notificaciones al canal seleccionado cuando el creador de contenido suba nuevos videos."
          );

        interaction.reply({
          embeds: [Completed],
          ephemeral: true,
        });
        break;

      case "delete":
        // Eliminar la configuración de notificaciones
        const deletedChannel = await YoutubeSchema.findOneAndDelete({
          guild: guild.id,
        });

        if (deletedChannel) {
          const Deleted = new EmbedBuilder()
            .setColor("Green")
            .setTitle("🗑 Configuración eliminada.")
            .setDescription(
              `Se ha eliminado la configuración de notificaciones para el canal <#${deletedChannel.channel}>.`
            );
          interaction.reply({
            embeds: [Deleted],
            ephemeral: true,
          });
        } else {
          const NotConfigured = new EmbedBuilder()
            .setTitle("⚠️ No se encontró ninguna configuración.")
            .setColor("Red")
            .setDescription(
              "No se encontró ninguna configuración de notificaciones para eliminar."
            );
          interaction.reply({
            embeds: [NotConfigured],
            ephemeral: true,
          });
        }
        break;
    }
  },
};

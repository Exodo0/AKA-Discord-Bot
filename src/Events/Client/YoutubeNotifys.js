const {
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
} = require("discord.js");
const YoutubeSchema = require("../../Schemas/Guilds/YoutubeNotifySchema");
const { google } = require("googleapis");

module.exports = {
  name: "interactionCreate",

  async execute(client, interaction) {
    const checkInterval = 5 * 60 * 1000; // Intervalo de 5 minutos (en milisegundos)

    try {
      const youtubeChannel = await YoutubeSchema.findOne({
        guild: interaction.guildId,
      });

      if (!youtubeChannel) return;

      const { guild, creatorID, channelName } = youtubeChannel;

      const discordGuild = await client.guilds.fetch(guild);
      const discordChannel = discordGuild.channels.cache.find(
        (channel) =>
          channel.name === channelName && channel.type === ChannelType.GuildText
      );

      if (!discordChannel) {
        console.log(
          "El canal configurado no existe o no es un canal de texto válido."
        );
        return;
      }

      const youtube = google.youtube({
        version: "v3",
        auth: creatorID,
      });

      // Función para verificar y enviar las notificaciones
      const checkNotifications = async () => {
        try {
          const response = await youtube.search.list({
            part: "snippet",
            channelId: creatorID,
            maxResults: 5, // Número máximo de resultados a obtener
            order: "date", // Ordenar por fecha de publicación
            type: "video", // Obtener solo videos
          });

          const videos = response.data.items;

          if (videos.length === 0) {
            console.log("No se encontraron nuevos videos.");
            return;
          }

          // Procesar los resultados de la consulta
          videos.forEach((video) => {
            const videoId = video.id.videoId;
            const videoTitle = video.snippet.title;
            const videoURL = `https://www.youtube.com/watch?v=${videoId}`;
            const thumbnailURL = video.snippet.thumbnails.default.url;

            // Ejemplo de respuesta
            const responseEmbed = new EmbedBuilder()
              .setTitle(
                `🔔 Actualizaciones nuevas sobre el canal: ${creatorID}`
              )
              .setURL(videoURL)
              .setFields({ name: "Titulo:", value: videoTitle })
              .setColor("Blue")
              .setThumbnail(thumbnailURL);

            discordChannel.send({ embeds: [responseEmbed] });
          });
        } catch (error) {
          console.log(error);
        }
      };

      // Verificar las notificaciones inmediatamente
      await checkNotifications();

      // Ejecutar la verificación en intervalos de tiempo regulares
      setInterval(checkNotifications, checkInterval);
    } catch (error) {
      console.log(error);
    }
  },
};

const {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  Client,
} = require("discord.js");
const superagent = require("superagent");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("twitch")
    .setDescription("🔎 Obten informacion sobre un canal de twitch")
    .addStringOption((option) =>
      option
        .setName("channel")
        .setDescription("🔎 ¿Cual es el canal que quieres revisar?")
        .setRequired(true)
    ),
  /**
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    const { options, member } = interaction;

    const channelName = options.getString("channel");

    interaction.deferReply();
    if (!channelName)
      return interaction.reply({
        content: "Tienes que introducir un canal de twitch valido.",
        ephermeral: true,
      });

    try {
      const Response = await superagent.get(
        `https://api.crunchprank.net/twitch/followcount/${channelName.toLowerCase()}`
      );
      const upTime = await superagent.get(
        `https://api.crunchprank.net/twitch/uptime/${channelName.toLowerCase()}`
      );
      const totalViews = await superagent.get(
        `https://api.crunchprank.net/twitch/total_views/${channelName.toLowerCase()}`
      );
      const accountage = await superagent.get(
        `https://api.crunchprank.net/twitch/creation/${channelName.toLowerCase()}`
      );
      const lastGame = await superagent.get(
        `https://api.crunchprank.net/twitch/game/${channelName.toLowerCase()}`
      );
      const avatarimg = await superagent.get(
        `https://api.crunchprank.net/twitch/avatar/${channelName.toLowerCase()}`
      );

      const embed = new EmbedBuilder()

        .setColor("Random")
        .setTitle(`Estadisticas del Canal: ${channelName} en Twitch`)
        .setDescription(
          `❣️ **Followers**: ${Response.text} \n
            👀 **Views**: ${totalViews.text}\n 
            ⬆ **Uptime**: ${upTime.text} \n
            📝 **Creado el**: ${accountage.text}  \n
            ⏮️ **Ultimo juego**: ${lastGame.text} \n
            🔴 **En directo**: ${upTime.text}`
        )
        .setFooter({
          text: `Pedido por: ${member.user.tag}`,
          iconURL: member.user.displayAvatarURL(),
        })
        .setURL(`https://twitch.tv/${channelName}`)
        .setThumbnail("https://pngimg.com/uploads/twitch/twitch_PNG27.png")
        .setImage(`${avatarimg.text}`)
        .setTimestamp();

      interaction.editReply({ embeds: [embed] });
    } catch (error) {
      return interaction.editReply({
        content: "Ocurrido un error inesperado.",
        ephermeral: true,
      });
    }
  },
};

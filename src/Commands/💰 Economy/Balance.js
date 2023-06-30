const {
  ChatInputCommandInteraction,
  Client,
  SlashCommandBuilder,
  EmbedBuilder,
  time,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("balance")
    .setDescription("💰 Revisa cuanto balance tienes o otro usuario.")
    .addUserOption((option) =>
      option.setName("user").setDescription("🤔 Selecciona al usuario.")
    ),
  /**
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    const user = interaction.options.getUser("user") || interaction.user;
    const dbBalance = await client.getBalance(user.id, interaction.guild.id);

    if (!dbBalance) {
      return await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setThumbnail(user.avatarURL({ dynamic: true }))
            .setColor("Red")
            .setDescription(
              `Oops! ${user.username} aún no tiene saldo. ¡Una razón para esto es que es posible que aún no hayan hablado en este servidor o que los administradores hayan eliminado su saldo!`
            ),
        ],
        ephemeral: true,
      });
    }

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`Balance Total de: ${user.username}`)
          .setDescription(`**El usuario tiene: $${dbBalance.balance}**`)
          .setFooter({ text: user.tag, iconURL: user.displayAvatarURL() })
          .setColor("Random")
          .setTimestamp(),
      ],
    });
  },
};

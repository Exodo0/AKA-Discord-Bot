const { ButtonInteraction, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "interactionCreate",
  /**
   * @param {ButtonInteraction} interaction
   */
  execute(interaction, client) {
    if (!interaction.isButton()) return;
    const Button = client.buttons.get(interaction.customId);

    if (interaction.isButton() && !Button) return;

    if (!Button)
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setTitle("⭕️ Tenemos un problema")
            .setDescription(
              "Al parecer el boton que intentas usar no esta funcionando. Intentalo mas tarde"
            ),
        ],
        ephemeral: true,
      });

    Button.execute(interaction, client);
  },
};

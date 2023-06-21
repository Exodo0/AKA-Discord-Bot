const { ChatInputCommandInteraction, Client } = require("discord.js");

module.exports = {
  name: "interactionCreate",
  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param { Client } client
   */
  execute(interaction, client) {
    client.config = require("../../../config");

    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command)
      return interaction.reply({
        content: "Ocurrio un error al ejecutar el comando intentalo mas Tarde!",
        ephemeral: true,
      });

    if (command.developer && interaction.user.id !== client.config.OwnerID)
      return interaction.reply({
        content: "Este Comando Solo esta Disponible para el desarrollador",
        ephemeral: true,
      });
    command.execute(interaction, client);
  },
};

const {
  ChatInputCommandInteraction,
  Client,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits,
} = require("discord.js");
const userPvpSchema = require("../../Schemas/Guilds/UserPvpSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pvp")
    .setDescription("📄 Configura o elimina nuestro Sistema de PVP Aleatorio")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addSubcommand((subcommand) => {
      return subcommand
        .setName("setup")
        .setDescription("🛠 Empezemos a configurar nuestro sistema.")
        .addChannelOption((channel) => {
          return channel
            .setName("channel")
            .setDescription(
              "🗂 Canal donde enviare las listas de los usuarios elegidos."
            )
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText);
        })
        .addStringOption((option) => {
          return option
            .setName("description")
            .setDescription("🖊 Quieres agregar una descripcion?.");
        })
        .addIntegerOption((option) => {
          return option
            .setName("amount")
            .setDescription(
              "🌰 Cuantos Jugadores podran hacer PVP. Ejemplo: (10 o 20) dividos en 1vs1"
            );
        });
    })
    .addSubcommand((subcommand) => {
      return subcommand
        .setName("delete")
        .setDescription("🛠 Borra nuestro sistema de PVP Aleatorizado..");
    }),

  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    if (interaction.options.getSubcommand() === "setup") {
      const channel = interaction.options.getChannel("channel");
      const descripcion = interaction.options.getString("description");
      const amount = interaction.options.getInteger("amount");

      const data = await appSchema.findOne({ guildId: interaction.guild.id });

      if (!data) {
        return await interaction.reply({
          content: "El sistema fue previamente configurado.",
          ephemeral: true,
        });
      }

      const Embed = new EmbedBuilder()
        .setTitle("Lista de Jugadores [PVP]")
        .setImage(interaction.guild.iconURL({ dynamic: true, size: 512 }))
        .setTimestamp();

      await channel.send({ embeds: [Embed] });

      await new appSchema({
        _id: new Types.ObjectId(),
        guildId: interaction.guild.id,
        channelId: channel.id,
        roleId: role.id,
      })
        .save()
        .then(async () => {
          return await interaction.reply({
            content: "¡Configuradó con éxito el sistema de aplicación!",
            ephemeral: true,
          });
        });
    }

    if (interaction.options.getSubcommand() === "delete") {
      const data = await appSchema.findOne({
        guildId: interaction.guild.id,
      });

      if (!data)
        return await interaction.reply({
          content: "Al parecer nunca hubo un sistema configurado",
          ephemeral: true,
        });

      await client.channels.cache
        .get(data.channelId)
        .send({
          embeds: [
            new EmbedBuilder()
              .setTitle("El sistema fue borrado.")
              .setColor("Random")
              .setFields({
                name: "El Usuario:",
                value: `${interaction.user.tag} Borro el sistema`,
              })
              .setTimestamp(),
          ],
        })
        .catch();
      await interaction.reply({
        content: "Sistema Borrado Correctamente",
        ephemeral: true,
      });
      return await data.deleteOne({ guildId: interaction.guild.id });
    }
  },
};

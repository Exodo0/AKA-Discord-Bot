const {
  ChatInputCommandInteraction,
  Client,
  SlashCommandBuilder,
  EmbedBuilder,
  time,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits,
} = require("discord.js");

const appSchema = require("../../Schemas/Guilds/appschema");
const { Types } = require("mongoose");
const userAppSchema = require("../../Schemas/Guilds/userAppSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("applications")
    .setDescription("Verifica a un usuario o Configura nuestro sistema.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addSubcommand((subcommand) => {
      return subcommand
        .setName("setup")
        .setDescription("🛠 Configura el sistema de applicaciones.")
        .addChannelOption((channel) => {
          return channel
            .setName("channel")
            .setDescription("🗂 Canal donde enviare el menu.")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText);
        })
        .addRoleOption((role) => {
          return role
            .setName("role")
            .setDescription("🔎 Que rol otorgare una vez sean validados.")
            .setRequired(true);
        })
        .addChannelOption((channel) => {
          return channel
            .setName("log_channel")
            .setDescription("📄 Donde enviare mi log.")
            .setRequired(true);
        })
        .addStringOption((option) => {
          return option
            .setName("description")
            .setDescription("🖊 Agrega una descripcion al menu.");
        });
    })
    .addSubcommand((subcommand) => {
      return subcommand
        .setName("verify")
        .setDescription("🔹 Verifica aun usuario.")
        .addStringOption((string) => {
          return string
            .setName("id")
            .setDescription("🖊 Ingresa el ID proporcionado en el Embed.")
            .setRequired(true);
        });
    })
    .addSubcommand((subcommand) => {
      return subcommand
        .setName("deny")
        .setDescription("🔴 Niega la aplicacion del usuario.")
        .addStringOption((string) => {
          return string
            .setName("id")
            .setDescription("🖊 Ingresa el ID proporcionado en el Embed.")
            .setRequired(true);
        })
        .addStringOption((string) => {
          return string
            .setName("reason")
            .setDescription("🖊 Ingresa una razon.")
            .setRequired(true);
        });
    })
    .addSubcommand((subcommand) => {
      return subcommand
        .setName("delete")
        .setDescription("🧹 Borra el Sistema de aplicaciones.");
    }),
  /**
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    if (interaction.options.getSubcommand() === "setup") {
      const channel = interaction.options.getChannel("channel");
      const logChannel = interaction.options.getChannel("log_channel");
      const description = interaction.options.getString("description");
      const role = interaction.options.getRole("role");

      const data = await appSchema.findOne({ guildId: interaction.guild.id });

      if (data) {
        return await interaction.reply({
          content: "¡El sistema de aplicación ya está configurado!",
          ephemeral: true,
        });
      }

      const embed = new EmbedBuilder()
        .setTitle("Verify")
        .setDescription(
          description || "Haga clic en el botón para aplicar al servidor!"
        )
        .setTimestamp();

      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setEmoji("✅")
          .setLabel("Aplicar")
          .setStyle(ButtonStyle.Success)
          .setCustomId("apply")
      );

      await channel.send({ embeds: [embed], components: [buttons] });

      await new appSchema({
        _id: new Types.ObjectId(),
        guildId: interaction.guild.id,
        channelId: logChannel.id,
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

    if (interaction.options.getSubcommand() === "verify") {
      const id = interaction.options.getString("id");
      const data = await userAppSchema.findOne({
        guildId: interaction.guild.id,
      });
      const appData = await appSchema.findOne({
        guildId: interaction.guild.id,
      });

      if (!data)
        return await interaction.reply({
          content: "¡El sistema de aplicación no está configurado!",
          ephemeral: true,
        });
      if (!data._id == id)
        return await interaction.reply({
          content: "¡No se encontró ese sistema de aplicación!",
          ephemeral: true,
        });
      if (!appData.roleId)
        return await interaction.reply({
          content:
            "¡No se encuentro el rol! El cual la aplicacion deberia otorgar",
          ephemeral: true,
        });

      const role = await interaction.guild.roles.fetch(appData.roleId);
      const channel = await client.channels.fetch(appData.channelId);
      const user = client.users.cache.get(data.userId);
      const member = interaction.guild.members.cache.get(data.userId);

      const embed = new EmbedBuilder()
        .setTitle("Aplicacion Verificada")
        .setDescription(
          `**Usuario:** ${user.tag} (${
            user.id
          })\n**Estatus:** Aceptado\n**Moderador**: ${interaction.user.tag} (${
            interaction.user.id
          })\n**Time:** ${time()}`
        )
        .setTimestamp()
        .setColor("Random");

      const embed2 = new EmbedBuilder()
        .setTitle("Hey tu formulario fue aceptado")
        .setDescription(`Ahora tienes mas acceso a: ${interaction.guild.name}!`)
        .setTimestamp()
        .setColor("Random");

      await user.send({ embeds: [embed2] });
      await channel.send({ embeds: [embed] });
      await member.roles.add(role);

      await userAppSchema.deleteOne({ _id: id });

      await interaction.reply({
        content: "Verificado correctamente.",
      });
    }

    if (interaction.options.getSubcommand() === "deny") {
      const id = interaction.options.getString("id");
      const reason = interaction.options.getString("reason");
      const data = await appSchema.findOne({ guildId: interaction.guild.id });
      const userData = await userAppSchema.findOne({
        guildId: interaction.guild.id,
      });

      if (!data)
        return await interaction.reply({
          content: "¡El sistema de aplicación no está configurado!",
          ephemeral: true,
        });
      if (!userData)
        return await interaction.reply({
          content: "¡Nadie ha aplicado al servidor todavía!",
          ephemeral: true,
        });
      if (!data.channelId)
        return await interaction.reply({
          content: "¡No se encuentra el canal del Formulario.!",
          ephemeral: true,
        });
      if (!userData._id == id)
        return await interaction.reply({
          content: "El Formulario no fue encontrado!",
          ephemeral: true,
        });
      if (!data.roleId)
        return await interaction.reply({
          content: "No se encuentra el rol que deberia otorgar el formulario!",
          ephemeral: true,
        });

      const channel = await client.channels.fetch(data.channelId);
      const user = client.users.cache.get(userData.userId);

      const userEmbed = new EmbedBuilder()
        .setTitle("Tu formulario fue denegado...")
        .setDescription(
          `Al parecer no obtendras acceso a:${interaction.guild.name}!\n****Razon:** \`${reason}\``
        )
        .setTimestamp()
        .setColor("Random");

      const denyEmbed = new EmbedBuilder()
        .setTitle("Formulario denegado")
        .setDescription(
          `**Usuario:** ${user.tag} (${
            user.id
          })\n**Estado:** Denegado\n**Moderador**: ${interaction.user.tag} (${
            interaction.user.id
          })\n**Time:** ${time()}\n**Razon:** \`${reason}\``
        )
        .setTimestamp()
        .setColor("Random");

      await channel.send({ embeds: [denyEmbed] });

      await userAppSchema.deleteOne({ _id: id });

      await interaction.reply({
        content: "Hecho. fue denegada la solicitud",
      });

      await user.send({ embeds: [userEmbed] }).catch(async () => {
        return await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Error")
              .setDescription(
                "El usuario tiene sus DMS cerrados. Lamentablemente no podre avisarle"
              )
              .setColor("RED"),
          ],
        });
      });
    }

    if (interaction.options.getSubcommand() === "delete") {
      const data = await appSchema.findOne({
        guildId: interaction.guild.id,
      });

      if (!data)
        return await interaction.reply({
          content: "¡El sistema de aplicación no está configurado!",
          ephemeral: true,
        });

      await client.channels.cache
        .get(data.channelId)
        .send({
          embeds: [
            new EmbedBuilder()
              .setTitle("El Sistema de formularios fue borrado.")
              .setDescription(
                `El usuario: ${interaction.user.tag} (${interaction.user.id}) Borro el formulario!`
              )
              .setTimestamp()
              .setColor("Random"),
          ],
        })
        .catch();

      await interaction.reply({
        content: "Formulario borrado correctamente.",
        ephemeral: true,
      });
      return await data.deleteOne({ guildId: interaction.guild.id });
    }
  },
};

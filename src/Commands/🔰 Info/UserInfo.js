const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Client,
  PermissionFlagsBits,
  EmbedBuilder,
  AttachmentBuilder,
} = require("discord.js");
const { profileImage } = require("discord-arts");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("user-info")
    .setDescription("🔎 Obten Informacion acerca de un Usuario.")
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
    .addUserOption((op) =>
      op.setName("user").setDescription("🔎 Agrega al usuario.")
    ),

  /**
   * @param { ChatInputCommandInteraction} interaction
   * @param { Client } client
   */

  async execute(interaction, client) {
    await interaction.deferReply();

    const User = interaction.options.getUser("user") || interaction.user;

    const TargetedUser = await interaction.guild.members.fetch(
      User.id || interaction.member.id || interaction.user.id
    );

    await TargetedUser.user.fetch();

    const buffer = await profileImage(TargetedUser.id, {});

    function joinedSuff(number) {
      if (number % 100 >= 11 && number % 100 <= 13) return number + "th";

      switch (number % 10) {
        case 1:
          return number + "st";
        case 2:
          return number + "nd";
        case 3:
          return number + "th";
      }
      return number + "th";
    }

    // Fetch all the members in the server and sort them by join date
    const fetchMembers = await interaction.guild.members.fetch();
    const JoinPos =
      Array.from(
        fetchMembers
          .sort((a, b) => a.joinedTimestamp - b.joinedTimestamp)
          .keys()
      ).indexOf(TargetedUser.id) + 1;

    // Get the accent color of the user, or set it to "Random" if it's not defined
    const Accent = TargetedUser.user.accentColor
      ? TargetedUser.user.accentColor
      : "Random";

    // Check the permissions of the user and set the appropriate role
    let index = 1;
    let Perm;
    if (TargetedUser.id === interaction.guild.ownerId) {
      Perm = "👑 Owner.";
    } else if (
      TargetedUser.permissions.has(PermissionFlagsBits.Administrator)
    ) {
      Perm = "👑 Administrador.";
    } else
      Perm = TargetedUser.permissions
        .toArray()
        .map((P) => `${index++}. ${P}.`)
        .join("\n");

    // Get the top 3 roles of the user
    const roles = TargetedUser.roles.cache
      .filter((role) => role.name !== "@everyone")
      .sort((a, b) => b.position - a.position)
      .map((role) => `• ${role.name}`)
      .slice(0, 3);

    // Create an embed message with the user's information
    const embed = new EmbedBuilder()
      .setAuthor({
        name: `${TargetedUser.user.username}`,
        iconURL:
          "https://cdn.discordapp.com/attachments/1064929361213530122/1066648072211410964/6879-member.png",
      })
      .setThumbnail(TargetedUser.user.avatarURL({ dynamic: true, size: 1024 }))
      .setColor(Accent)
      .setImage(`attachment://profile.png`)
      .setDescription(
        `:t_rex: **Informacion del usuario:** ${TargetedUser.user}
        
        **${TargetedUser.user.tag}** Se unió como el **${joinedSuff(
          JoinPos
        )}** Miembro 
        de este servidor: (\`${interaction.guild.name}\`).
        `
      )
      .addFields(
        {
          name: `📋 Se unio a Discord:`,
          value: `<t:${parseInt(TargetedUser.user.createdTimestamp / 1000)}:R>`,
          inline: true,
        },
        {
          name: `📋 Se unio al servidor:`,
          value: `<t:${parseInt(TargetedUser.joinedTimestamp / 1000)}:R>`,
          inline: true,
        },
        {
          name: `📋 Nickname:`,
          value: `\`\`\`${TargetedUser.nickname || "Ninguno"} \`\`\``,
        },
        {
          name: `📋 ID:`,
          value: `\`\`\` ${TargetedUser.id} \`\`\``,
          inline: true,
        },
        {
          name: `📋 Color:`,
          value: `\`\`\`${
            TargetedUser.user.accentColor
              ? `#${TargetedUser.user.accentColor.toString(16)}`
              : "Ninguno"
          }\`\`\``,
          inline: true,
        },
        {
          name: `📋 Es un Bot:`,
          value: `\`\`\`${TargetedUser.user.bot ? "Yes" : "No"} \`\`\``,
          inline: true,
        },
        {
          name: `📋 Permisos:`,
          value: `\`\`\`${Perm}\`\`\``,
        },
        {
          name: `🔝 Top (3) Roles:`,
          value: `\`\`\`ansi\n${roles.join("\n")}\`\`\``,
        },
        {
          name: `💰 Discord Nitro:`,
          value: `\`\`\`${
            TargetedUser.user && TargetedUser.user.premium_type === 2
              ? "Sí"
              : "No"
          }\`\`\``,
        }
      );

    const attachment = new AttachmentBuilder(buffer, { name: "profile.png" });
    await interaction.followUp({ files: [attachment], embeds: [embed] });
  },
};

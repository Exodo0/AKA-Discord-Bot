const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Client,
  PermissionFlagsBits,
  EmbedBuilder,
  ChannelType,
  UserFlags,
  version,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
} = require("discord.js");
const { connection } = require("mongoose");
const os = require("os");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("status")
    .setDescription("🔧 Muestra el estado del bot"),
  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    await client.user.fetch();
    await client.application.fetch();
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel("Support")
        .setURL("https://discord.gg/YmgnJmP23W")
    );

    function getChannelSize(type) {
      const textChannelsType = [
        ChannelType.GuildText,
        ChannelType.GuildForum,
        ChannelType.GuildAnnouncement,
      ];
      const voiceChannelsType = [
        ChannelType.GuildVoice,
        ChannelType.GuildStageVoice,
      ];
      const ThreadsType = [
        ChannelType.GuildPublicThread,
        ChannelType.GuildPrivateThread,
        ChannelType.GuildNewsThread,
      ];
      let size;
      if (type === "text")
        size = client.channels.cache.filter((channel) =>
          textChannelsType.includes(channel.type)
        ).size;
      else if (type === "voice")
        size = client.channels.cache.filter((channel) =>
          voiceChannelsType.includes(channel.type)
        ).size;
      else if (type === "Threads")
        size = client.channels.cache.filter((channel) =>
          ThreadsType.includes(channel.type)
        ).size;
      return size;
    }
    let ping;
    if (100 > client.ws.ping || 100 === client.ws.ping) {
      ping = `<:Excellent:1064941249519435916> ${client.ws.ping}`;
    } else if (300 > client.ws.ping && 300 === client.ws.ping) {
      ping = `<:Good:1064941246050750475> ${client.ws.ping}`;
    } else if (500 > client.ws.ping || 500 === client.ws.ping) {
      ping = `<:Bad:1064941251805319188> ${client.ws.ping}`;
    } else {
      ping = `<:Problem:1064941065976688691> ${client.ws.ping}`;
    }
    const textFormatter = new Intl.ListFormat("en-GB", {
      style: "long",
      type: "conjunction",
    });
    const status = [
      "🟥 Disconnected.",
      "🟩 Connected.",
      "🟨 Connecting....",
      "🟧 Disconnecting....",
    ];

    const aboutBotEmbed = new EmbedBuilder()
      .setColor("Random")
      .setAuthor({
        name: `${client.user.username}'s Information.`,
        iconURL: client.user.avatarURL(),
      })
      .setThumbnail(client.user.avatarURL({ size: 1024 }))
      .setDescription(client.application.description || "None")
      .addFields(
        // { name: ``, value: `` },
        {
          name: `\`⭕\` Bot Information:`,
          value: `
          ᲼᲼\`🤖\`**Name:** \`${client.user.tag}\`
          ᲼᲼\`💳\`**Id:** \`${client.user.id}\`
          ᲼᲼\`👑\`**Owner:** ${
            client.application.owner.ownerId
              ? client.application.owner.name
              : client.application.owner.username
          }
          ᲼᲼\`✅\`**Verified:** \`${
            client.user.flags & UserFlags.VerifiedBot ? "Yes" : "No"
          }\`
          ᲼᲼\`📅\`**Created:** <t:${parseInt(
            client.user.createdTimestamp / 1000
          )}:D>
          ᲼᲼\`🔖\`**Tags:** ${
            client.application.tags.length
              ? textFormatter.format(
                  client.application.tags.map((tag) => `\`${tag}\``)
                )
              : "None"
          }
          `,
        },
        {
          name: `\`⭕\` System Information:`,
          value: `
          ᲼᲼\`🖥\`**Operating System:** ${os
            .type()
            .replace("Windows_NT", "Windows")
            .replace("Darwin", "macOS")}
            ᲼᲼\`⏳\`**Up Since:** <t:${parseInt(
              client.readyTimestamp / 1000
            )}:R>
            ᲼᲼\`🌐\`**Ping:** ${ping}ms
            ᲼᲼\`📺\`**CPU Model:** ${os.cpus()[0].model}
            ᲼᲼\`🔋\`**CPU Usage:** ${(
              process.memoryUsage().heapUsed /
              1024 /
              1024
            ).toFixed(2)}%
            ᲼᲼\`📚\`**Database:** ${status[connection.readyState]}
            ᲼᲼\`👩🏻‍🔧\`**Node.js:** ${process.version}
            ᲼᲼\`🚧\`**Discord.js:** ${version}`,
        },
        //! optional--------------------------------
        {
          name: `\`⭕\` Feature Information:`,
          value: `
          ᲼᲼\`💽\`**Commands:** ${client.commands.size}
          ᲼᲼\`✨\`**Events:** ${client.events.size}
          ᲼᲼\`🔘\`**Buttons:** ${client.buttons.size}
          ᲼᲼\`📑\`**Modals:** ${client.modals.size}
          ᲼᲼\`🎫\`**Select Menus:** ${client.selectMenus.size}
        `,
        },
        {
          name: `\`⭕\` Basic Information:`,
          value: `
          ᲼᲼\`🌌\`**Servers:** ${client.guilds.cache.size}
          ᲼᲼\`👥\`**Users:** ${client.users.cache.size}
          ᲼᲼\`😏\`**Emojis:** ${client.emojis.cache.size}
          ᲼᲼\`💬\`**Text Channels:** ${getChannelSize("text")}
          ᲼᲼\`🔊\`**Voice Channels:** ${getChannelSize("voice")}
          ᲼᲼\`🚧\`**Threads:** ${getChannelSize("Threads")}
          `,
        }
      );

    interaction.reply({
      embeds: [aboutBotEmbed],
      components: [row],
    });
  },
};

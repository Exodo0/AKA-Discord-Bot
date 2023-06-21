const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  ChannelType,
} = require("discord.js");
const TicketSetup = require("../../Schemas/Tickets/TicketSetup");
const config = require("../../configTicket");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("⚙ Configura el Sistema de Tickets.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("🔎 Selecciona el canal donde se crearan los tickets.")
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText)
    )
    .addChannelOption((option) =>
      option
        .setName("category")
        .setDescription(
          "📂 Selecciona la categoria donde se crearan los tickets."
        )
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildCategory)
    )
    .addChannelOption((option) =>
      option
        .setName("transcripts")
        .setDescription(
          "📋 Selecciona el canal donde se enviaran los transcripts."
        )
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText)
    )
    .addRoleOption((option) =>
      option
        .setName("handlers")
        .setDescription("👑 Selecciona el rol que podra responder los tickets.")
        .setRequired(true)
    )
    .addRoleOption((option) =>
      option
        .setName("everyone")
        .setDescription("📂 Selecciona tu rol @everyone. o Miembros.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("description")
        .setDescription("📝 Escribe una descripcion para el embed.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("button")
        .setDescription("🔎 Escribe el nombre del boton que se mostrara.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("emoji")
        .setDescription("😊 Ingresa el emoji que se mostrara en el boton.")
        .setRequired(true)
    )
    .addAttachmentOption((option) =>
      option
        .setName("image")
        .setDescription("🖼️ Ingresa una imagen para el embed.")
    ),
  async execute(interaction) {
    const { guild, options } = interaction;
    try {
      const channel = options.getChannel("channel");
      const category = options.getChannel("category");
      const transcripts = options.getChannel("transcripts");
      const handlers = options.getRole("handlers");
      const everyone = options.getRole("everyone");
      const description = options.getString("description");
      const button = options.getString("button");
      const image = options.getAttachment("image");
      const emoji = options.getString("emoji");
      await TicketSetup.findOneAndUpdate(
        { GuildID: guild.id },
        {
          Channel: channel.id,
          Category: category.id,
          Transcripts: transcripts.id,
          Handlers: handlers.id,
          Everyone: everyone.id,
          Description: description,
          Button: button,
          Emoji: emoji,
        },
        {
          new: true,
          upsert: true,
        }
      );
      const embed = new EmbedBuilder()
        .setDescription(description)
        .setImage(image?.url || null)
        .setColor("Random");
      const buttonshow = new ButtonBuilder()
        .setCustomId(button)
        .setLabel(button)
        .setEmoji(emoji)
        .setStyle(ButtonStyle.Primary);
      await guild.channels.cache
        .get(channel.id)
        .send({
          embeds: [embed],
          components: [new ActionRowBuilder().addComponents(buttonshow)],
        })
        .catch((error) => {
          return;
        });
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("✅ Sistema de Tickets configurado correctamente.")
            .setColor("Green"),
        ],
        ephemeral: true,
      });
    } catch (err) {
      console.log(err);
      const errEmbed = new EmbedBuilder()
        .setColor("Red")
        .setDescription(config.ticketError);
      return interaction
        .reply({ embeds: [errEmbed], ephemeral: true })
        .catch((error) => {
          return;
        });
    }
  },
};

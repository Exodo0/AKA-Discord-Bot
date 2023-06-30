const {
  ChatInputCommandInteraction,
  Client,
  SlashCommandBuilder,
  EmbedBuilder,
  time,
} = require("discord.js");
const userSchema = require("../../Schemas/Economy/userEconomySchema");
const userEconomySchema = require("../../Schemas/Economy/userEconomySchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pay")
    .setDescription("💵 Pagale a un usuario la cantidad deseada.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("🔎 Selecciona al Usuario.")
        .setRequired(true)
    )
    .addNumberOption((option) =>
      option
        .setName("amount")
        .setDescription("💸 Cuanto Pagaras?")
        .setRequired(true)
        .setMaxValue(1000)
        .setMinValue(1)
    ),
  /**
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    const user = interaction.options.getUser("user");

    const userBalance = await client.fetchBalance(
      interaction.user.id,
      interaction.guild.id
    );
    let amount = interaction.options.getNumber("amount");

    if (user.bot || user.id === interaction.user.id)
      return await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              "👻 ¡No puedes enviarte dinero a ti mismo ni a un bot!"
            )
            .setColor("Red"),
        ],
        ephemeral: true,
      });

    if (amount > userBalance.amount)
      return await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              "🥲 No tienes suficiente dinero en tu saldo para pagarle."
            )
            .setColor("Red"),
        ],
      });

    const selectedUserBalance = await client.fetchBalance(
      user.id,
      interaction.guildId
    );

    amount = await client.toFixedNumber(amount);

    await userEconomySchema.findOneAndUpdate(
      { _id: userBalance._id },
      { balance: await client.toFixedNumber(userBalance.balance - amount) }
    );

    await userEconomySchema.findOneAndUpdate(
      { _id: selectedUserBalance._id },
      {
        balance: await client.toFixedNumber(
          selectedUserBalance.balance + amount
        ),
      }
    );

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(`Has transferido con éxito: $${amount} a: ${user}!`)
          .setColor("Green"),
      ],
      ephemeral: true,
    });

    await client.users.cache.get(user.id).send({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `Has recibido un total de: ${amount} por: ${
              interaction.user
            }! Esta cantidad ha sido depositada en su saldo y su total ahora es de: $${
              selectedUserBalance.balance + amount
            }`
          )
          .setColor("Green")
          .setImage(
            "https://cdn.discordapp.com/attachments/1073136797913206805/1099609517773299813/money-banner.png"
          ),
      ],
    });
  },
};

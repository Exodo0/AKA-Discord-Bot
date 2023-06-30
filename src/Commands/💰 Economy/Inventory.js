const {
  ChatInputCommandInteraction,
  Client,
  SlashCommandBuilder,
  EmbedBuilder,
  time,
} = require("discord.js");

const userInventorySchema = require("../../Schemas/Economy/inventorySchema");
const userEconomySchema = require("../../Schemas/Economy/userEconomySchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("inventory")
    .setDescription("🗒️ Comprueba qué artículos compraste en la tienda.")
    .addSubcommand((subCommand) => {
      return subCommand
        .setName("view")
        .setDescription("🗒️ Revisa tu inventario.")
        .addNumberOption((option) =>
          option.setName("page").setDescription("📝 ¿A que Pagina quieres ir?")
        );
    })
    .addSubcommand((subCommand) => {
      return subCommand
        .setName("use_item")
        .setDescription("🫴🏻 Usa un artículo de tu inventario")
        .addStringOption((str) => {
          return str
            .setName("identifier")
            .setDescription("🔎 Identificador del artículo")
            .setRequired(true);
        });
    }),
  /**
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    switch (interaction.options.getSubcommand()) {
      case "view":
        const page = interaction.options.getNumber("page");
        const inventoryData = await userInventorySchema.find({
          guildId: interaction.guild.id,
          userId: interaction.user.id,
        });

        if (!inventoryData?.length)
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setDescription(
                  "🥲 ¡No tienes ningún artículo en tu inventario!"
                )
                .setColor("Red"),
            ],
          });

        const embed = new EmbedBuilder()
          .setTitle(`Inventario de: ${interaction.user.username}`)
          .setColor("Random");

        // if the user selected a page
        if (page) {
          const pageNum = 5 * page - 5;

          if (inventoryData.length >= 6) {
            embed.setFooter({
              text: `Pagina: ${page} de: ${Math.ceil(
                inventoryData.length / 5
              )}`,
            });
          }

          for (const item of inventoryData.splice(pageNum, 5)) {
            embed.addFields({
              name: `📝 ${item._id}`,
              value: `🗒️ Nota: \`${item.note}\`\n > Fecha de la nota: ${item.noteDate}\n > Moderador: ${moderator}`,
            });
          }

          return await interaction.reply({ embeds: [embed] });
        }

        if (inventoryData.length >= 6) {
          embed.setFooter({
            text: `page 1 of ${Math.ceil(inventoryData.length / 5)}`,
          });
        }

        for (const item of inventoryData.slice(0, 5)) {
          embed.addFields({
            name: `${item.itemName}  <->  $${item.itemPrice}`,
            value: `> Identificador: \`${item.itemIdentifier}\`\n> Descripcion: ${item.itemDescription}\n> Rol Otorgado: <@&${item.role}>\n> Dinero Otorgado: ${item.money}\n`,
          });
        }

        await interaction.reply({ embeds: [embed] });
        break;
      case "use_item":
        const identifier = interaction.options.getString("identifier");
        const invSchema = await userInventorySchema.findOne({
          guildId: interaction.guild.id,
          userId: interaction.user.id,
        });

        if (!invSchema || !invSchema.itemIdentifier === identifier) {
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setDescription(
                  "🥲 ¡Aún no has comprado ese artículo en la tienda o ese artículo no existe!"
                )
                .setColor("Red"),
            ],
          });
        }

        const item = await userInventorySchema.findOne({
          guildId: interaction.guild.id,
          userId: interaction.user.id,
          itemIdentifier: identifier,
        });

        if (!item.role && !item.money)
          return await interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setDescription(
                  "👻 ¡Ese artículo no se puede usar, es solo para mostrar!"
                )
                .setColor("Red"),
            ],
          });

        if (item.role) {
          await interaction.member.roles.add(item.role).catch((err) => {
            interaction.reply({
              content:
                "ERROR: No puedo darte el rol. Puede ser porque no tengo permisos o porque no estoy por encima del rol. Póngase en contacto con los administradores de este servidor y pídales que solucionen esto.",
            });

            return console.log(err);
          });

          await userInventorySchema.findOneAndDelete({ _id: item._id });

          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setDescription(
                  `El Rol: ${interaction.guild.roles.cache.get(
                    item.role
                  )} te ha sido dado!`
                )
                .setColor("Green"),
            ],
            ephemeral: true,
          });
        }

        if (item.money) {
          const selectedUserBalance = await client.fetchBalance(
            interaction.user.id,
            interaction.guild.id
          );

          await userEconomySchema.findOneAndUpdate(
            { _id: selectedUserBalance._id },
            {
              balance: await client.toFixedNumber(
                selectedUserBalance.balance + item.money
              ),
            }
          );

          await userInventorySchema.findOneAndDelete({
            _id: item._id,
          });

          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setDescription(`$${item.money} ha sido agregado a su saldo!`)
                .setColor("Green"),
            ],
            ephemeral: true,
          });
        }
        break;
      default:
        break;
    }
  },
};

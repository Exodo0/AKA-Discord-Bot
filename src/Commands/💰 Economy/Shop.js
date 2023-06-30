const {
  ChatInputCommandInteraction,
  Client,
  SlashCommandBuilder,
  EmbedBuilder,
  time,
  PermissionFlagsBits,
} = require("discord.js");
const shopSchema = require("../../Schemas/Economy/shopSchema");
const userEconomySchema = require("../../Schemas/Economy/userEconomySchema");
const userInventorySchema = require("../../Schemas/Economy/inventorySchema");
const { Types } = require("mongoose");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("shop")
    .setDescription(
      "🛒 ¡Revisa la tienda del Servidor o Cambia su configuración!"
    )
    .addSubcommand((subCommand) => {
      return subCommand
        .setName("add")
        .setDescription("🛍️  Agrega algun Item a la tienda.")
        .addStringOption((str) => {
          return str
            .setName("name")
            .setDescription("🛍️ Ingresa el nombre del producto.")
            .setRequired(true);
        })
        .addStringOption((str) => {
          return str
            .setName("description")
            .setDescription("🛍️ Ingresa la descripcion del Item")
            .setRequired(true);
        })
        .addNumberOption((num) => {
          return num
            .setName("price")
            .setDescription("💹 Cual sera el precio?")
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(1000000);
        })
        .addRoleOption((option) =>
          option
            .setName("role")
            .setDescription(
              "➕ ¡Dale al usuario este rol cuando use este artículo!"
            )
        )
        .addNumberOption((option) =>
          option
            .setName("money")
            .setDescription(
              "💵 ¡Dale dinero al usuario cuando use este artículo!"
            )
        )
        .addStringOption((str) => {
          return str
            .setName("identifier")
            .setDescription(
              "🗒️ Ingresa el identificador del item. (si no se proporciona, se generará uno)"
            )
            .setRequired(false);
        });
    })
    .addSubcommand((subCommand) => {
      return subCommand
        .setName("view")
        .setDescription("🏪 Vamos a revisar tu tienda!")
        .addNumberOption((num) => {
          return num
            .setName("page")
            .setDescription("🔎 Que pagina quieres ver?");
        });
    })
    .addSubcommand((subCommand) => {
      return subCommand
        .setName("buy")
        .setDescription("🛍️ Compra un Articulo de la tienda.")
        .addStringOption((option) => {
          return option
            .setName("identifier")
            .setDescription(
              "🔎 Ingresa el identificador del artículo que deseas comprar."
            );
        });
    })
    .addSubcommand((subCommand) => {
      return subCommand
        .setName("remove")
        .setDescription("➖ Elimina un artículo de la tienda!")
        .addStringOption((option) => {
          return option
            .setName("identifier")
            .setDescription(
              "📝 Ingresa el Identificador del Item que vas a eliminar."
            );
        });
    }),
  /**
   * @param {Client} client
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    const { options, guild } = interaction;

    switch (options.getSubcommand()) {
      case "add":
        const itemName = options.getString("name");
        const itemDescription = options.getString("description");
        const itemPrice = options.getNumber("price");
        const itemIdentifier =
          options.getString("identifier") || client.generateToken(5);
        const money = options.getNumber("money") || null;
        let role = null;
        if (interaction.options.getRole("role"))
          role = interaction.options.getRole("role").id;

        if (
          !interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)
        )
          return await interaction.reply({
            content: "¡No tienes suficientes permisos para usar este comando!",
          });

        new shopSchema({
          _id: new Types.ObjectId(),
          guildId: interaction.guild.id,
          itemName: itemName,
          itemDescription: itemDescription,
          itemPrice: itemPrice,
          itemIdentifier: itemIdentifier,
          role: role || null,
          money: money,
        }).save();

        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("¡Nuevo artículo agregado!")
              .setColor("Random")
              .setThumbnail(client.user.displayAvatarURL())
              .setDescription(
                "¡Artículo agregado a la tienda, para ver la tienda actualizada, Usa `/shop view`!"
              )
              .addFields(
                {
                  name: "Nombre del árticulo:",
                  value: itemName,
                },
                {
                  name: "Descripcion del árticulo:",
                  value: itemDescription,
                },
                {
                  name: "Precio del árticulo:",
                  value: `$${itemPrice}`,
                },
                {
                  name: "Identificador del árticulo:",
                  value: `\`${itemIdentifier}\``,
                },
                {
                  name: "Dinero Otorgado al reclamar:",
                  value: `\`$${money || "No Especificado"}\``,
                },
                {
                  name: "Rol Otorgado al reclamar:",
                  value: `<@&${role || "No Especificado"}>`,
                }
              ),
          ],
        });
        break;
      case "view":
        const page = options.getNumber("page");
        const shopData = await shopSchema.find({
          guildId: interaction.guild.id,
        });
        if (!shopData)
          return await interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setThumbnail(client.user.displayAvatarURL())
                .setDescription("¡No hay artículos en esta tienda!")
                .setColor("Red"),
            ],
          });

        const embed = new EmbedBuilder()
          .setTitle(`Tienda del servidor`)
          .setDescription(
            "Para comprar un artículo por favor usa: `/shop buy`!"
          )
          .setColor("Random")
          .setThumbnail(guild.iconURL({ dynamic: true }));

        if (page) {
          const pageNum = 5 * page - 5;

          if (shopData.length >= 6) {
            embed.setFooter({
              text: `Pagina: ${page} de: ${Math.ceil(shopData.length / 5)}`,
            });
          }

          for (const item of shopData.splice(pageNum, 5)) {
            embed.addFields({
              name: `${item.itemName}  <->  $${item.itemPrice}`,
              value: `> Identificador: \`${
                item.itemIdentifier
              }\`\n> Descripcion: ${item.itemDescription}\n> Rol Otorgado: <@&${
                item.role
              }>\n> Dinero Otorgado: ${item.money || "No Especificado"} \n`,
            });
          }

          return await interaction.reply({ embeds: [embed] });
        }

        if (shopData.length >= 6) {
          embed.setFooter({
            text: `Pagina 1 de: ${Math.ceil(shopData.length / 5)}`,
          });
        }

        for (const item of shopData.slice(0, 5)) {
          embed.addFields({
            name: `${item.itemName}  <->  $${item.itemPrice}`,
            value: `> Identificador: \`${
              item.itemIdentifier
            }\`\n> Descripcion: ${item.itemDescription}\n> Rol Otorgado: <@&${
              item.role
            }>\n> Dinero Otorgado: ${item.money || "No Especificado"}\n`,
          });
        }

        await interaction.reply({ embeds: [embed] });
        break;

      case "buy":
        const identifier = interaction.options.getString("identifier");
        const itemShopData = await shopSchema.findOne({
          guildId: interaction.guild.id,
        });
        const userBalance = await client.fetchBalance(
          interaction.user.id,
          interaction.guild.id
        );
        const InvData = await userInventorySchema.findOne({
          guildId: interaction.guild.id,
          userId: interaction.user.id,
          itemIdentifier: identifier,
        });

        if (InvData)
          return await interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setDescription("¡Ya has comprado este artículo!")
                .setColor("Red"),
            ],
          });

        if (!itemShopData.itemIdentifier === identifier)
          return await interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setDescription(
                  "¡No existe ningún artículo con ese identificador!"
                )
                .setColor("Red"),
            ],
          });

        const item = await shopSchema.findOne({
          guildId: interaction.guild.id,
          itemIdentifier: identifier,
        });

        if (item.itemPrice > userBalance.balance)
          return await interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setThumbnail(client.user.displayAvatarURL())
                .setColor("Red")
                .setDescription(
                  "🥲 !No tienes suficiente dinero para comprar este artículo.!"
                ),
            ],
          });

        await userEconomySchema.findOneAndUpdate(
          { _id: userBalance._id },
          {
            balance: await client.toFixedNumber(
              userBalance.balance - item.itemPrice
            ),
          }
        );

        new userInventorySchema({
          _id: new Types.ObjectId(),
          guildId: interaction.guild.id,
          userId: interaction.user.id,
          itemIdentifier: identifier,
          itemName: item.itemName,
          itemPrice: item.itemPrice,
          itemDescription: item.itemDescription,
          role: item.role,
          money: item.money,
        })
          .save()
          .catch((err) => console.log(err));

        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("Green")
              .setDescription(
                `Compraste: ${item.itemName} Por la cantidad de: $${item.itemPrice}! Este artículo se ha movido a su inventario.`
              ),
          ],
        });

        break;
      case "remove":
        if (
          !interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)
        ) {
          return await interaction.reply({
            content: "¡No tiene suficientes permisos para usar este comando!",
          });
        }

        const ID = interaction.options.getString("identifier");

        if (
          !shopSchema.findOne({
            guildId: interaction.guild.id,
            itemIdentifier: ID,
          })
        ) {
          return await interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setDescription("Ese Item no existe.")
                .setColor("Red"),
            ],
            ephemeral: true,
          });
        }

        await shopSchema.findOneAndDelete({
          guildId: interaction.guild.id,
          itemIdentifier: ID,
        });

        return await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription("¡Eliminó ese artículo de la tienda!.")
              .setColor("Red"),
          ],
          ephemeral: true,
        });
        break;
      default:
        break;
    }
  },
};

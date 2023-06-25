const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const TicketSchema = require("../../Schemas/Tickets/Ticket.js");
const config = require("../../configTicket.js");

module.exports = {
  name: "interactionCreate",
  async execute(interaction, client) {
    const { guild, member, customId, channel } = interaction;
    const { ManageChannels, SendMessages } = PermissionFlagsBits;
    if (!["ticket-manage-menu"].includes(customId)) return;
    await interaction.deferUpdate();
    await interaction.deleteReply();
    const embed = new EmbedBuilder();
    try {
      const data = await TicketSchema.findOne({
        GuildID: guild.id,
        ChannelID: channel.id,
      });
      if (!data)
        return interaction
          .reply({
            embeds: [embed.setColor("Red").setDescription(config.ticketError)],
            ephemeral: true,
          })
          .catch((error) => {
            return;
          });
      const findMembers = await TicketSchema.findOne({
        GuildID: guild.id,
        ChannelID: channel.id,
        MembersID: interaction.values[0],
      });
      if (!findMembers) {
        data.MembersID.push(interaction.values[0]);
        await channel.permissionOverwrites.edit(interaction.values[0], {
          SendMessages: true,
          ViewChannel: true,
          ReadMessageHistory: true,
        });
        await interaction.channel
          .send({
            embeds: [
              embed
                .setColor("Green")
                .setDescription(
                  "<@" +
                    interaction.values[0] +
                    ">" +
                    " " +
                    config.ticketMemberAdd
                ),
            ],
          })
          .catch((error) => {
            return;
          });
        await data.save();
      } else {
        data.MembersID.pull(interaction.values[0]);
        await channel.permissionOverwrites.delete(interaction.values[0]);
        await interaction.channel
          .send({
            embeds: [
              embed
                .setColor("Green")
                .setDescription(
                  "<@" +
                    interaction.values[0] +
                    ">" +
                    " " +
                    config.ticketMemberRemove
                ),
            ],
          })
          .catch((error) => {
            return;
          });
        await data.save();
      }
    } catch (error) {
      console.error(error);
    }
  },
};

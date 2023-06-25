const { Client, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

const AntiLinks = require("../../Schemas/Guilds/AntiLinksSchema");

module.exports = {
  name: "messageCreate",

  async execute(message) {
    // Verificar si el mensaje fue enviado por un bot o en un canal privado
    if (message.author.bot || !message.guild) {
      return;
    }

    // Verificar si el usuario tiene permisos de administrador o permisos de manejar mensajes
    if (
      message.member.permissions.has(PermissionFlagsBits.Administrator) ||
      message.member.permissions.has(PermissionFlagsBits.ManageMessages) ||
      message.member.permissions.has(PermissionFlagsBits.ManageGuild)
    ) {
      return;
    }

    // Obtener la configuración de AntiLinks para esta guild
    const antiLinks = await AntiLinks.findOne({ guildId: message.guild.id });

    // Si la configuración de AntiLinks no existe, no hacer nada
    if (!antiLinks) {
      return;
    }

    // Verificar si el mensaje contiene un enlace
    if (
      message.content.includes("https://") ||
      message.content.includes("http://") ||
      message.content.includes("discord.gg")
    ) {
      // Borrar el mensaje
      message.delete();

      // Si showMessage es verdadero, enviar un mensaje al usuario que envió el enlace
      if (antiLinks.showMessage) {
        const antiembed = new EmbedBuilder()
          .setTitle("🚫 Sistema de Moderacion")
          .setDescription(
            `${message.author}, ¡El envío de enlaces está **prohibido** y ha sido bloqueado por nuestro asistente! Espera 1 Minuto para volver a enviar un mensaje.`
          )
          .setColor("Red")
          .setTimestamp();
        await message.author.send({ embeds: [antiembed] });
      }
      const role = message.guild.roles.cache.get(antiLinks.roleId);
      if (role) {
        await message.member.roles.add(role);
      }
      setTimeout(async () => {
        await message.member.roles.remove(role);
      }, 60000);
      // Enviar un mensaje de registro en el canal AntiLinks
      const channel = message.guild.channels.cache.get(antiLinks.channelId);
      if (channel) {
        const embed = new EmbedBuilder()
          .setTitle("🚫 Sistema de Moderacion")
          .setColor("Red")
          .setFields(
            {
              name: "El Usuario:",
              value: `${message.author.tag} (${message.author.id})`,
            },
            {
              name: "Envio al Canal:",
              value: `${message.channel} (${message.channel.id})`,
            },
            { name: "Este Mensaje", value: `${message.content}` },
            {
              name: "Se le otorgo un Mute de 1 Minuto",
              value: `${role}`,
            }
          )
          .setFooter(
            {
              text: "Cuidado al revisar el Link",
            },
            message.author.displayAvatarURL({ dynamic: true })
          );
        await channel.send({ embeds: [embed] });
      }
    }
  },
};

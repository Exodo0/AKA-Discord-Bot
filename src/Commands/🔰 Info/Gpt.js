const { codeBlock, SlashCommandBuilder } = require("discord.js");
const { Configuration, OpenAIApi } = require("openai");
const { OpenIA } = require("../../../config");

const configuration = new Configuration({
  apiKey: OpenIA,
});
const openai = new OpenAIApi(configuration);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("gpt")
    .setDescription("🗣️ ¡Preguntale a Chat-GPT por una respuesta o pregunta!")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("question")
        .setDescription("🗣️ !Envia una pregunta a Chat-GPT!")
        .addStringOption((option) =>
          option
            .setName("q-content")
            .setDescription("🤔 Que quieres saber?")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("image")
        .setDescription("🖼️ ¡Pidele a Chat-GPT que genere una imagen!")
        .addStringOption((option) =>
          option
            .setName("i-content")
            .setDescription("🖼️ ¿Describeme que generare?")
            .setRequired(true)
        )
    ),
  async execute(interaction) {
    await interaction.deferReply();

    const subCommand = interaction.options.getSubcommand();
    const question = interaction.options.getString("q-content");
    const image = interaction.options.getString("i-content");

    switch (subCommand) {
      case "question":
        {
          interaction.editReply({
            content: `Espere mientras proceso su pregunta.`,
          });

          try {
            const response = await openai.createCompletion({
              model: "text-davinci-003", // Most powerful model so far
              prompt: question,
              max_tokens: 2048, // 2048 because that's the maximum amount of characters in Discord
              temperature: 0.5,
            });

            interaction.editReply({
              content: codeBlock(response.data.choices[0].text),
            });
          } catch (error) {
            console.log(error);
            interaction.editReply({
              content:
                "¡Solicitud fallida! ¡Por favor, inténtelo de nuevo más tarde!",
            });
          }
        }
        break;

      case "image":
        {
          await interaction.editReply({
            content: "¡Espere mientras se generan sus imagenes!",
          });

          try {
            const response = await openai.createImage({
              prompt: image,
              n: 3, // Amount of images to send
              size: "512x512", // 256x256 or 512x512 or 1024x1024
            });

            const images = response.data.data.map((image) => ({
              url: image.url,
              label: "Siguiente",
            }));

            await interaction.editReply({
              content: "¡Aquí están tus imagenes!",
              files: images.map((image) => ({
                attachment: image.url,
                name: "image.png",
              })),
            });
          } catch (error) {
            console.log(error);
            interaction.editReply({
              content:
                "¡Solicitud fallida! ¡Por favor, inténtelo de nuevo más tarde!",
            });
          }
        }

        break;
    }
  },
};

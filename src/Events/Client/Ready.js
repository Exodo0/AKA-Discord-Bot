const { MONGO_URI } = require("../../../config.json");
const { loadCommands } = require("../../Handlers/CommandHandler");
const { connect } = require("mongoose");
const chalk = require("chalk");

// Función para esperar durante 2 minutos
function wait(minutes) {
  const milliseconds = minutes * 60 * 1000;
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    console.log(chalk.green("💠 >>> Bot is online!"));
    console.log(
      chalk.yellowBright(`💠 >>> in ${client.guilds.cache.size} servers`)
    );

    const activityList = [
      `🎵 En ${client.guilds.cache.size} servidores`,
      `🎵 Con ${client.users.cache.size} usuarios`,
      `🎵 Revisando ${client.channels.cache.size} canales`,
    ];

    const setRandomActivity = () => {
      const index = Math.floor(Math.random() * activityList.length);
      const activity = activityList[index];
      client.user.setActivity(activity);
      //console.log(chalk.yellow(`💠 >>> Changed activity to: ${activity}`));
    };

    // Setea la actividad inicial al bot al iniciar
    setRandomActivity();
    client.user.setStatus("Watching");

    // Cambia la actividad cada 10 segundos
    setInterval(setRandomActivity, 10000);

    // Conexión a MongoDB
    try {
      await connect(MONGO_URI);
      console.log(chalk.yellow(`✅ >>> Successfully connected to MongoDB!`));
    } catch (err) {
      console.log(chalk.red(`❌ >>> Error connecting to MongoDB: ${err}`));
    }
    loadCommands(client);

    // Esperar durante 2 minutos
    console.log("Esperando 2 minutos antes de apagar...");
    await wait(2);

    // Apagar el bot
    console.log("Apagando el bot...");
    // ... código para apagar el bot ...
    console.log("El bot se ha apagado correctamente.");
  },
};

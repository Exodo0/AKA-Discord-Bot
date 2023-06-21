const { MONGO_URI } = require("../../../config.json");
const { loadCommands } = require("../../Handlers/CommandHandler");
const { connect } = require("mongoose");
const chalk = require("chalk");

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
  },
};

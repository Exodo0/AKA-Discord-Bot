async function loadCommands(client) {
  const { loadFiles } = require("../Functions/fileLoader");
  client.commands = new Map();

  await client.commands.clear();
  let commandsArray = [];

  const Files = await loadFiles("./src/Commands");

  Files.forEach((file) => {
    const command = require(file);

    client.commands.set(command.data.name, command);
    commandsArray.push(command.data.toJSON());
  });

  await client.application.commands.set(commandsArray);

  console.table(
    commandsArray.map((command) => ({
      Commands: command.name,
      Status: "🔹",
    })),
    ["Commands", "Status"]
  );
}

module.exports = { loadCommands };

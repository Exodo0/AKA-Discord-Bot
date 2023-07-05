const { loadFiles } = require("../Functions/fileLoader");
async function loadButtons(client) {
  console.time("Buttons Loaded");
  client.buttons = new Map();
  await client.buttons.clear();
  const buttons = [];

  const files = await loadFiles("/src/Buttons");

  for (const file of files) {
    try {
      const button = require(file);
      client.buttons.set(button.id, button);
      buttons.push({
        Buttons: button.id,
        Status: "🔹",
      });
    } catch (error) {
      buttons.push({
        Buttons: file.split("/").pop().slice(0, -3),
        Status: "🔴",
      });
    }
  }

  console.table(buttons, ["Buttons", "Status"]);
  console.info("\n\x1b[36m%s\x1b[0m", "Loaded Buttons");
  console.timeEnd("Buttons Loaded");
}

module.exports = { loadButtons };

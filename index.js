console.clear();
const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
} = require("discord.js");
const {
  Guilds,
  GuildMembers,
  GuildMessages,
  GuildPresences,
  GuildVoiceStates,
  MessageContent,
} = GatewayIntentBits;
const { User, Message, GuildMember, ThreadMember } = Partials;
const client = new Client({
  intents: [
    Guilds,
    GuildPresences,
    GuildMembers,
    GuildMessages,
    GuildVoiceStates,
    MessageContent,
  ],
  partials: [User, Message, GuildMember, ThreadMember, GuildPresences],
});

const { loadEvents } = require("./src/Handlers/EventHandler");
client.config = require("./config.json");
client.selectMenus = new Collection();
client.modals = new Collection();
client.buttons = new Collection();
loadEvents(client);

client.login(client.config.Token);

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
const fetchBalance = require("./src/Functions/FetchBalance");
const getbalance = require("./src/Functions/GetBalance");
const gerateToken = require("./src/Functions/GenerateToken");

client.config = require("./config.json");
client.selectMenus = new Collection();
client.modals = new Collection();

loadEvents(client);
fetchBalance(client);
getbalance(client);
gerateToken(client);

client.toFixedNumber = (num) => {
  return parseFloat(num.toFixed(2));
};

client.login(client.config.Token);

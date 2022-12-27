const { GatewayIntentBits, REST, Routes, Events } = require('discord.js');
const discord = require('discord.js');
const client = new discord.Client({ intents: [GatewayIntentBits.Guilds] });
const TOKEN = "<DISCORD_BOT_TOKEN>";
const CLIENT_ID = "<DISCORD_BOT_CLIENT_ID>";

const commands = [
    {
        name: "hello",
        description: "world!"
    }
];

const rest = new REST({ version: 10 }).setToken(TOKEN);

(async () => {
    console.log("슬래시 커맨드 새로고침");
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands })
})();

client.on('error', (err) => {
    console.log(`Error happened: ${err.message}`);
});

client.on('ready', () => {
    console.log(`Logged in with ${client.user.username}`);
});

client.on(Events.InteractionCreate, interaction => {
    if (!interaction.isChatInputCommand()) return;
    console.log(interaction);
    interaction.reply("Hello world!");
});

client.login(TOKEN);

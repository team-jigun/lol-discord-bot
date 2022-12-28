const { GatewayIntentBits, REST, Routes, Events } = require('discord.js');
const discord = require('discord.js');
const client = new discord.Client({ intents: [GatewayIntentBits.Guilds] });
const TOKEN = "<DISCORD_BOT_TOKEN>";
const CLIENT_ID = "<DISCORD_CLIENT_ID>";

const RIOT_API_KEY = "<RIOT_API_KEY>";
const RiotRequest = require('riot-lol-api');
const riotClient = new RiotRequest(RIOT_API_KEY);

const commands = [
    {
        name: "hello",
        description: "world!",
        /**
         * 
         * @param {discord.Interaction} interaction 
         */
        handle: (interaction) => {
            interaction.reply("Hello world!");
        }
    },
    {
        name: "matches",
        description: "입력한 닉네임의 최근 전적을 표시해줍니다",
        options: [
            {
                name: "region",
                description: "검색할 서버의 지역 코드입니다.",
                type: 3,
                required: true
            },
            {
                name: "username",
                description: "검색할 유저의 닉네임입니다.",
                type: 3,
                required: true
            },
            {
                name: "count",
                description: "최근 몇판까지 불러올 수 있는지 지정하는 파라미터입니다.",
                type: 4,
                required: false
            }
        ],
        /**
         * 
         * @param {discord.Interaction} interaction 
         */
        handle: async (interaction) => {
            await interaction.reply("잠시 기다려 주세요...");
            const message = await interaction.fetchReply();
            const region = interaction.options.getString("region")
            const username = interaction.options.getString("username")
            const count = interaction.options.getInteger("count") ?? 20;

            const summoner = await new Promise((resolve, reject) => {
                // 오래걸리는 작업을 실행
                riotClient.request(region, 'summoner', `/lol/summoner/v4/summoners/by-name/${encodeURI(username)}`, (err, data) => {
                    if (err) reject(err)
                    resolve(data)
                })
            })

            const cluster = riotClient.getClusterFromRegion(region)

            const matchIds = await new Promise((resolve, reject) => {
                riotClient.request(cluster, 'match', `/lol/match/v5/matches/by-puuid/${summoner.puuid}/ids?count=${count}`, (err, data) => {
                    if (err) reject(err)
                    resolve(data)
                })
            })

            console.log(matchIds)
        }
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
    commands.find(command => command.name == interaction.commandName).handle(interaction);
});

client.login(TOKEN);

const { Client, Collection, GatewayIntentBits, Events } = require('discord.js');
const { token, guildId } = require('./config.json');
const server = require('./server-service');
const fs = require('node:fs');

const path = require('node:path');
const { warn } = require('./logger');
const {params} = require('./config/globalParams');

const args = process.argv.slice(2); // Get a subset of the array starting from the third element

// Loop through the array and add the parameters to the object
args.forEach((arg) => {
    if (arg.startsWith('--')) {
      params[arg.slice(2)] = true;
    } else if (arg.startsWith('-')) {
      params[arg.slice(1)] = true;
    }
});

//? Create a new client instance
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds, 
		GatewayIntentBits.GuildMembers, 
		GatewayIntentBits.GuildBans, 
		GatewayIntentBits.GuildEmojisAndStickers, 
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildMessageTyping,
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.GuildIntegrations,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.DirectMessageReactions,
		GatewayIntentBits.DirectMessageTyping,
	]
});

//? Fill commands
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	if ('data' in command && ('execute' in command || 'autocomplete' in command)) {
		client.commands.set(command.data.name, command);
	} else warn(`The command at ${filePath} is missing a required "data" or "execute" property.`);
}

//? Fill events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) client.once(event.name, (...args) => event.execute(...args));
	else client.on(event.name, (...args) => event.execute(...args));
}

//? Login to Discord
const run = async () => {
	await client.login(token);
	const guild = await client.guilds.fetch(guildId);
	server.start(client, guild);
	// server.postHandler(guild);
}

run();


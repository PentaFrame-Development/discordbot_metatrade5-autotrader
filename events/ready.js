const { Channels } = require("../data/channels-id.js");
const { success, Bright, color, info, Dim, error } = require("../logger.js");
const { Events, EmbedBuilder } = require('discord.js');
const moment = require('moment');
const utils = require('../utils');
const { guildId } = require('../config.json');
const { GoldPot } = require("../services/rest.js");

// const ora = require('ora');
// const cliSpinners = require('cli-spinners');


// const Discord = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		//Create message
		// fetch('localhost:3000').then(d => d.text()).then(console.log);
		success(`Ready! Successfully logged in as ${color(client.user.tag, Bright)}`);
		//Create image
		// var em = new EmbedBuilder()
		// 	.setColor("#FEC721")
		// 	.setTitle('Richiesta di supporto')
		// 	// .setTimestamp()
		// 	.setFooter({text:`• titolo (required): se non inserito nel comando ti contatterò tramite DM.\n• messaggio (opzionale): se omesso, verrà usato solo \`titolo\` come testo del messaggio.\n\n${moment().format('HH:mm')}`})
		// 	.setDescription(`@everyone è possibile creare un ticket :ticket: usando il comando\n\n\`/ticket\` \`titolo:esempio titolo\` \`messaggio:esempio messaggio\`\n\noppure semplicemente \`/ticket\`\n>>> Questo comando prevede due parametri titolo e messaggio, i quali se omessi, verranno richiesti tramite DM (direct message/messaggio privato), al fine di completare l'operazione.\n\n`);
		// client.guilds.fetch('848657308057731093').then(g => g.channels.fetch('915990416124432435').then(ch => ch.send({ embeds: [em] })));
		// client.guilds.fetch('848657308057731093').then(g => g.channels.fetch('848657878029303838').then(ch => {
		// 	const gif = 'https://media.giphy.com/media/3o7bufgPP70ra2ZVi8/giphy.gif'
		// 	const embed = new Discord.MessageEmbed().setColor('#FF8DC4').setTitle("My respect Don Ferdinando").setDescription('BOTFATHER').setImage(gif);
		// 	ch.send({embeds: [embed]});
		// }));
		run(client);
		// const spinner = ora({spinner: cliSpinners.simpleDotsScrolling, color: 'gray'}).start();

	},
};

const run = (client) => {
	// setInterval(async ()=>{
	// 	if (moment().minute() % 2 == 0) info(color('Updating status', Dim));
	// 	try {
	// 		const guild = await client.guilds.fetch(guildId);
	// 		const channel = await guild.channels.fetch(Channels.todelete);
	// 		const status = await GoldPot.getStatus();
	// 		const lastMsg = await channel.messages.edit(channel.lastMessageId, { embeds: [utils.makeStatusEmbed(status)] });
	// 	} catch(e) {error(e); }
	// }, 1000*60*15);
}

// const checkSupportTickets = (client) => {
// 	client.channels.fetch(Channels.support)
// 		.then(channel => channel.messages.fetch({ limit: 10 })
// 			.then(messages => {
// 				// console.log(messages);
// 			})
// 			.catch(console.error)
// 		).catch(console.error);
// }
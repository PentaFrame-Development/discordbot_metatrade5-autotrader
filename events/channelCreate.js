const { Events } = require('discord.js');

module.exports = {
	name: Events.ChannelCreate,
	execute(channel) {
		// console.log(`Created a new channel -> ${channel.name}`);
	},
};
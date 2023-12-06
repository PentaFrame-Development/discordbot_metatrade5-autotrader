const { Events, ChannelType } = require('discord.js');
const { CleanChannels } = require('../config/autoCleanChannel');
const {info, error } = require('../logger');

module.exports = {
	name: Events.MessageCreate,
	async execute(message) {
        try {
            if (message.channel.type === ChannelType.GuildText && CleanChannels.indexOf(message.channelId) > -1) {
                var messages = await message.channel.messages.fetch();
                messages.each(async msg => {
                    if (!(msg.id === messages.last().id)) {
                        await msg.delete();
                        info(`Only command alowed on channel ${message.channel.name}`);
                    }
                });
                // await message.channel.bulkDelete(messages.last(messages.size-1));
            }
        } catch(e) {error('Error while listening messageCreate event -> '+e)}
	},
};
const { ChannelType } = require('discord.js');
const { Channels } = require('../data/channels-id.js');
const { welcome } = require("../data/chat.json");
const { replaceM } = require('../utils');
const { Events } = require('discord.js');

module.exports = {
    name: Events.GuildMemberAdd,
    execute (guildMember) {
        guildMember.guild.channels.fetch(Channels.generale)
            .then(channel => {
                if (channel.type === ChannelType.GuildText) 
                    channel.send(replaceM(welcome, '', guildMember.id, guildMember.guild.name));
            }).catch(console.error);
    }
}
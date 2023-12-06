const { Channels } = require('../data/channels-id');
const { Events } = require('discord.js');

module.exports = {
    name: Events.ThreadCreate,
    execute(threadChannel) {
        threadChannel.fetch()
            .then(channel => {
                if (channel.id === Channels.technicalSupport) {
                    // addTechnicalTicket(threadChannel.id);
                }
            })
            .catch(console.error);
    }
}
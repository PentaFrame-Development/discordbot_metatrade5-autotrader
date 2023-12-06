const { SlashCommandBuilder } = require('@discordjs/builders');
const { Channels } = require('../data/channels-id.js');
const { NO_SUPPORT_CHANNEL, TICKET_CREATED, TICKET_CREATED_DM, TOO_MANY_REQUEST_FOR_TICKET } = require('../data/chat.json');
const { ASSISTENZA_ID } = require("../data/role.id.json");
const utils = require('../utils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ticket')
        .addStringOption(option => option.setName('titolo').setDescription('Titolo del ticket, descivi in breve il problema (required)'))
        .addStringOption(option => option.setName('messaggio').setDescription('Fornisci ulteriori informazioni riguardo il tuo problema'))
		.setDescription('Apri ticket per richiedere assistenza, funziona solo in un canale di supporto'),
	async execute(interaction) {
        // SE NON E TRA I CANALI DI SUPPORTO ESCO
		if (!(interaction.channelId === Channels.support) && !(interaction.channelId === Channels.technicalSupport)){
            await interaction.reply(NO_SUPPORT_CHANNEL);
            return
        }


        if(interaction.member.roles.cache.some(r => r.id === ASSISTENZA_ID)){
            interaction.reply({content: TOO_MANY_REQUEST_FOR_TICKET, ephemeral: true});
        } else {
            const title = interaction.options.getString('titolo');
            const message = interaction.options.getString('messaggio');
            
            await interaction.member.roles.add(ASSISTENZA_ID);
            interaction.reply({content: !title ? TICKET_CREATED_DM : TICKET_CREATED, ephemeral: true});
            utils.createTicket(interaction, title, message);
        }

        setTimeout(() => interaction.deleteReply(), 1000 * 10);
    
	}
}   
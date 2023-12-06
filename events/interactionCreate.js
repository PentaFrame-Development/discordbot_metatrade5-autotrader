
const { Events } = require('discord.js');
const { error, info } = require('../logger');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
        try {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command && !interaction.isButton()) {
                error(`No command matching ${interaction.commandName} was found.`);
                return;
            }
            if (interaction.isChatInputCommand()) command.execute(interaction);
            else if (interaction.isAutocomplete()) command.autocomplete(interaction);
            return;
        } catch(e){ error(e); }
	},
};
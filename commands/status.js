const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const {GoldPot} = require('../services/rest');
const util = require('../utils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('status')
		.setDescription('Get MT5 account status')
		.setDefaultMemberPermissions(PermissionFlagsBits.ViewChannel | PermissionFlagsBits.UseApplicationCommands),
	async execute(interaction) {
		const status = await GoldPot.getStatus(interaction.user.id);
		if(!status) return;
		console.log(status);
		await interaction.reply({embeds:[util.makeStatusEmbed(status)]});
	},
}
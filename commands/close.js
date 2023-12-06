const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { xau_usd_prefix, blue_forex_prefix } = require('../config.json');
const { success, error, info } = require('../logger');
const { GoldPot } = require('../services/rest');
const { REQUEST_EXECUTED_SUCCESS, REQUEST_EXECUTED_ERROR } = require('../data/chat.json');
const utils = require('../utils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('close')
		.setDescription('Close a position or delete an order by ID. close all if empty')
		.addStringOption(option =>
			option.setName('id')
				.setDescription('Close by pack ID')
				.setAutocomplete(true))
		.addStringOption(option =>
			option.setName('xau_usd')
				.setDescription('Close a XAUUSD(helawi) position by pack ID')
				.setAutocomplete(true))
		.addStringOption(option =>
			option.setName('blue_forex')
				.setDescription('Close a Blue Forex position by pack ID')
				.setAutocomplete(true)),

	async autocomplete(interaction) {
		const focusedOption = interaction.options.getFocused(true);
		// console.log(focusedOption); // { value: '', type: 3, name: 'close', focused: true }
		var subOptions = [];

		switch (focusedOption.name) {
			case 'id': subOptions = await utils.updateGPPersistence(true, interaction.user.id); break;
			case 'xau_usd': subOptions = await utils.updateGPPersistence(true, interaction.user.id, xau_usd_prefix); break;
			case 'blue_forex': subOptions = await utils.updateGPPersistence(true, interaction.user.id, blue_forex_prefix); break;
		}
		const filtered = focusedOption.value && subOptions.length ? subOptions.filter(choice => choice.name.includes(focusedOption.value)) : subOptions;
		await interaction.respond(
			filtered.map(choice => ({ name: choice.name, value: choice.value })),
		);
	},

	async execute(interaction) {
		var idOption = interaction.options.get('id');
		const xauOption = interaction.options.get('xau_usd');
		const blufoOption = interaction.options.get('blue_forex');
		const resObj = { message: '', code: null, errors: [] };

		/** Checking if the value property of idOption is equal to the value property of either xauOption or blufoOption. 
		 * If this is the case, idOption is set to null. 
		 * If any of the conditions fail (i.e. idOption is falsy, or either of the options are falsy, or the values are not equal), idOption remains unchanged. */
		idOption = (idOption && (xauOption || blufoOption) && (idOption.value === xauOption.value || idOption.value === blufoOption.value)) ? null : idOption

		const _closepack = async (mainID) => {
			const res = await GoldPot.delete(mainID, interaction.user.id);
			resObj.code = (resObj.code === null || resObj.code != res.code) ? res.code : 1;
			resObj.code === 0 ? success(res.message) : error(res.message + utils.joinErrors(res.errors)); // LOG
			resObj.message += (resObj.message ? '\n' : '') + (res.code === 0 ? `pacco \`${mainID}\` chiuso.` : res.message);
			resObj.errors.push(res.errors);
		};

		//# OPTIONS
		if (xauOption) await _closepack(xauOption.value);
		if (blufoOption) await _closepack(blufoOption.value);
		if (idOption) await _closepack(idOption.value);

		if (resObj.message) interaction.reply({ embeds: [utils.makeExeStatusEmbed(resObj.code, resObj.message, resObj.errors, false)] });
		//# ALL
		else utils.closeAction(interaction);
	},
};

const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
// const {xau_usd_prefix, blue_forex_prefix} = require('../config.json');
const { success, error } = require('../logger');
const { GoldPot } = require('../services/rest');
const { REQUEST_EXECUTED_SUCCESS, REQUEST_EXECUTED_ERROR, SET_VOLUME_EMPTY } = require('../data/chat.json');
const utils = require('../utils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('set_volume')
		.setDescription('Set volume for a strategy.')
		.addStringOption(option =>
			option.setName('all')
				.setDescription('Set volume for all strategy in list'))
		.addStringOption(option =>
			option.setName('xau_usd')
				.setDescription('Set volume for XAU_USD strategy'))
		.addStringOption(option =>
			option.setName('blue_forex')
				.setDescription('Set volume for Blue Forex strategy')),

	async execute(interaction) {
		var allOption = interaction.options.get('all');
		const xauOption = interaction.options.get('xau_usd');
		const blufoOption = interaction.options.get('blue_forex');
		const resObj = { message: '', code: null, errors: [] };

		const _setvolume = async (volume, strategy = 'all') => {
			v = volume;
			volume = parseFloat(volume);
			if (isNaN(volume)) { error(`Can't parse volume ${v}`); return; };
			const res = await GoldPot.setVolume(volume, interaction.user.id, strategy);
			resObj.code = (resObj.code === null || resObj.code === res.code) ? res.code : 1;
			resObj.code === 0 ? success(res.message) : error(res.message); // LOG
			resObj.message += (resObj.message ? '\n' : '') + (res.message);
			if (res.errors) res.errors.forEach(e => e && resObj.errors.push(e));
		};

		//# OPTIONS
		if (allOption) await _setvolume(allOption.value);
		if (xauOption) await _setvolume(xauOption.value, 'xau_usd');
		if (blufoOption) await _setvolume(blufoOption.value, 'blue_forex');

		if (resObj.message) interaction.reply({ embeds: [utils.makeExeStatusEmbed(resObj.code, resObj.message, resObj.errors, false)] });
		//# ALL
		else {
			interaction.reply({ embeds: [utils.makeExeStatusEmbed(1, SET_VOLUME_EMPTY, [])] })
			setTimeout(() => interaction.deleteReply(), 1000 * 60);
		}
	},
};

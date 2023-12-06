const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { GoldPot } = require('../services/rest');
const utils = require('../utils');
const util = require('../utils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('get_config_info')
        .setDescription('Show configuration values (volume, deviation ...)'),
    // .setDefaultMemberPermissions(PermissionFlagsBits.ViewChannel | PermissionFlagsBits.UseApplicationCommands),

    async execute(interaction) {
        const _makeConfigInfotext = (config) => {
            var r = '';
            Object.keys(config).forEach((k) => r += `${k} -> \`${config[k]}\`\n`);
            return r
        }
        const res = await GoldPot.getConfigInfo(interaction.user.id);
        interaction.reply({ embeds: [utils.makeExeStatusEmbed(res.code, _makeConfigInfotext(res.body), res.errors, false, true)] });
    },
}
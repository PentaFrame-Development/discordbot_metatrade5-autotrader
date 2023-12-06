const { dyland420 } = require("./data/member-id.json");
const { SUPPORTO_ID, EVERYONE_ID, ASSISTENZA_ID } = require("./data/role.id.json");
const { TICKET_ID } = require("./data/category-id.json");
const { TICKET_CHANNEL_CREATED } = require("./data/chat.json");
const { orders, positions } = require("./persistence/goldPot/orders.json");
const relationData = require("./persistence/idRelationsForReply.json");
const { OrderTypes, PositionTypes, fromValue } = require('./data/mt5-types')
const { REQUEST_EXECUTED_SUCCESS, REQUEST_EXECUTED_ERROR } = require('./data/chat.json');
const { ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle, SlashCommandBuilder, PermissionsBitField, Collection, PermissionFlagsBits } = require('discord.js');

const fs = require('node:fs');
var moment = require('moment');
const { Dim, color, Bright, error, info, success } = require("./logger");
const { GoldPot } = require("./services/rest");
const path = require("node:path");
const console = require("node:console");
const { params } = require('./config/globalParams');
// const { GoldPot } = require("./services/rest");

module.exports = {
    // OTTIMIZZARE PER PARAMETRI MULTIPLI
    replaceM(data, id, mention, guildName, timestamp, contentTitle, content) {
        const now = new Date().getHours();
        data = data.replace(/\{\?\}/g, `<@${mention || ''}>`);
        data = data.replace(/\{T\}/g, (now >= 0 && now <= 7 ? 'Buongiorno' : now >= 8 && now <= 15 ? 'Buon pomeriggio' : 'Buonasera'));
        data = data.replace(/\{t\}/g, timestamp || '');
        data = data.replace(/\{id\}/g, id || '');
        data = data.replace(/\{c\}/g, content || '');
        data = data.replace(/\{ct\}/g, contentTitle || '');
        data = data.replace(/\{GN\}/g, guildName || '');
        data = data.replace(/\{author\}/g, `<@${dyland420}>`);
        return data;
    },
    async createTicket(interaction, title, message) {
        try {
            var DMChannel = await interaction.user.createDM();
            if (!title) {
                await DMChannel.send(`<@${interaction.user.id}> Inserisci il **titolo** del ticket, descivi in breve il problema:`);
                const filter = m => m.author.id === interaction.user.id;
                const collector = DMChannel.createMessageCollector({ filter, time: (1000 * 60 * 10), max: 1 });
                collector.on('collect', async m => {
                    if (!message) {
                        m.reply({ content: "Descrivi nel dettaglio il problema:" });
                        var col = await DMChannel.awaitMessages({ filter, time: (1000 * 60 * 5), max: 1 });
                        this.sendTicket(interaction, DMChannel, m.content, col.first().content);
                    } else this.sendTicket(interaction, DMChannel, m.content, message);
                });
            } else this.sendTicket(interaction, DMChannel, title, message)
        } catch (e) { error(`Can't creating support ticket while DM to ${interaction.user.username}`); }
    },
    // Mandare un ticket richiede una conferma ulteriore da parte dell'utente
    //TODO: differenziare supporto tecnico da supporto
    async sendTicket(interaction, DMchannel, title, content) {
        var data = await this.exeConfimation(interaction, DMchannel || interaction.channel, interaction.user, title, content, 'Si');
        if (!data.res) {
            data.checkMessage.reply("Operazione annullata.");
            return;
        }
        const timestamp = new Date();
        var newChannel = await interaction.guild.channels.create({
            name: `🎫_${moment(timestamp.getTime()).format("DDMMYYhhmm")}-${interaction.user.username}`,
            reason: 'Need support',
            // type: ChannelType.GuildText, //DEFAULT
            permissionOverwrites: [
                { id: EVERYONE_ID, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel] },
                { id: SUPPORTO_ID, allow: [PermissionsBitField.Flags.ViewChannel] }
            ]
        });

        if (!newChannel || !data.checkMessage) { error('Error during new ticket channel creation'); return; }

        // var invite = await newChannel.createInvite();
        // data.embed.setURL(invite.url);
        // data.checkMessage.edit({ embeds: [data.embed] });

        newChannel.setParent(TICKET_ID, { lockPermissions: false });
        newChannel.send(this.replaceM(TICKET_CHANNEL_CREATED, '', interaction.user.id, interaction.guild.name, moment(timestamp.getTime()).format("DD MMMM YYYY hh:mm"), title, content));
        info(`Created a new ticket (channel) on ${interaction.channel.name} by ${color(interaction.user.username, Bright)} -> ${newChannel.name}`);
        data.checkMessage.reply({ content: `Perfetto, è stato creato un ticket, receverai a breve una risposta.\n${newChannel.url}`, ephemeral: !DMchannel });
    },

    exeConfimation(interaction, channel, user, title, body, confirmLabel, clearLabel) {
        if (!channel || !user) return;
        const res = new Promise(async (resolve, reject) => {
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('clear').setLabel(clearLabel || 'No').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId('add').setLabel(confirmLabel || 'Si').setStyle(ButtonStyle.Success)
            );
            const embed = new EmbedBuilder().setColor('#ffffff').setTitle(title || '').setDescription(body || '').setFooter({ text: moment().format('HH:ss') });
            const f_button = (i) => (i.customId === 'add' || i.customId === 'clear') && i.user.id === user.id;
            var checkMessage = await channel.send({ content: 'Riassumendo, vuoi pubblicare il ticket?', embeds: [embed], components: [row] });
            channel.createMessageComponentCollector({ f_button, time: 1000 * 20, max: 1 })
                .on('collect', async b => {
                    // row.components.forEach(el => el.setDisabled(true));
                    checkMessage.edit({ components: [] });
                    if (b.customId === 'clear') await interaction.member.roles.remove(ASSISTENZA_ID);
                    resolve({ res: b.customId === 'add', checkMessage });
                });
        });
        return res;
    },

    tgDsRelationsHandler(message, tgMessageID, channelID, persistencePath = "./persistence/idRelationsForReply.json", maxPersistence = 750) {
        var channel = relationData[channelID || message.channelId] || [];
        channel.push({ tgMessageID, discordMessageID: message.id });
        relationData[channelID || message.channelId] = channel.slice(-maxPersistence);

        try {
            fs.writeFile(persistencePath, JSON.stringify(relationData),
                () => (params.v || params.verbose) && success(`${color('Reply persistence updated on \'' + persistencePath + '\' for channelID ' + (channelID || message.channelId), Dim)}`));
        } catch (e) { error(`Error while updating reply persistence '${persistencePath}'`); }
    },

    async updateGPPersistence(merge = false, userID, prefix = '', persistencePath = "./persistence/goldPot/orders.json") {
        const _getProfit = (tickets) => {
            var res = 0;
            tickets.forEach(t => res += t.profit);
            return `${res < 0 ? '🔴' : res > 0 ? '🟢' : '⚪'} $ ${res.toFixed(2)}`;
        }
        var data = await GoldPot.getStatus(userID);
        if (!data) return;
        data = {
            // orders: data.orders.map(o => {if(o.id && (o.id+'').startsWith(prefix)) return {name: `📦 ${fromValue(o.data[0].type).toUpperCase()} • ${o.id}`, value: o.id+''};}).filter(i => i != null) || [], 
            orders: data.orders.filter(o => o.id && o.id.toString().startsWith(prefix)).map(o => ({ name: `📦 ${fromValue(o.data[0].type).toUpperCase()} • ${o.id}`, value: o.id.toString() })) || [],
            positions: data.positions.filter(p => p.id && p.id.toString().startsWith(prefix)).map(p => ({ name: `${_getProfit(p.data)} ${p.data[0].type % 2 == 0 ? 'LONG' : 'SHORT'} • ${p.id}`, value: p.id.toString() })) || [],
        };

        try {
            fs.writeFile(persistencePath, JSON.stringify(data), () => (params.v || params.verbose) && success(`${color('GP persistence updated on \'' + persistencePath + '\'', Dim)}`));
        } catch (e) { error(`Error while updating GOLD POT persistence '${persistencePath} -> ${e}'`); }

        return !merge ? data : [...data.orders, ...data.positions];
    },

    makeStatusEmbed(status) {
        if (!status) return;
        const _makeStatusBody = () =>
            `Broker server -> \`${status.account.server}\`` + '\n' +
            `Company-> ${status.account.company}` + '\n' +
            `Currency -> ${status.account.currency}`;

        const _makeFields = () => {
            const statusField =
                `Equity -> \`${status.account.equity}\`` + '\n' +
                `Balance-> \`${status.account.balance}\`` + '\n' +
                `Open profit -> \`${status.account.profit.toFixed(2)}\`\n` +
                (status.account.credit > 0 ? `Credit -> ${status.account.credit}\n` : '');

            const configFIeld =
                `Leverage -> \`${status.account.leverage}\`` + '\n' +
                `Free margin -> \`${status.account.margin_free.toFixed(2)}\`` + '\n' +
                `Margin level -> \`${status.account.margin_level.toFixed(2)}\``;

            return [
                { name: `STATUS`, value: statusField, inline: true },
                { name: 'SETTINGS', value: configFIeld, inline: true }
            ];
        }
        return embed = new EmbedBuilder()
            .setColor('#FEC721')
            .setTitle(`${(status.account && status.account.name) || ''}`)
            // .setAuthor({name: `GoldPot MT5 - ${}`})
            .setDescription(_makeStatusBody())
            .setFields(..._makeFields())
            .setFooter({ text: moment().format('HH:mm') });
    },

    makeExeStatusEmbed(code, message, errors, autodelete = true, min = false) {
        const prefixText = code === 0 ? REQUEST_EXECUTED_SUCCESS : code === -1 ? REQUEST_EXECUTED_ERROR : ':warning: '
        const res = new EmbedBuilder().setColor(code === 0 ? 0x26A69A : code === -1 ? 0xEF5350 : 0xFEC721).setDescription((!min ? prefixText : '') + message + this.joinErrors(errors));
        return autodelete ? res.setFooter({ text: '• Il messaggio si eliminerà tra 1 minuto' }) : res;
    },

    joinErrors(errors) {
        return errors ? errors.map(e => `\nCode **${e.code}**: ${e.message} for ticket ${e.ticket}`).join('\n') : '';
    },

    async closeAction(interaction) {
        var timeout;
        const selectionDelay = 60;
        const timerPhrase = `\nIl comando si annulla <t:${Math.floor(Date.now() / 1000) + selectionDelay + 1}:R>`;
        const embTitle = 'Seleziona un opzione';
        const embDescription = 'Questo comando prevede la chiusura di tutti i tickets di una delle seguenti opzioni:';
        const emb = this.makeExeStatusEmbed(1, `${timerPhrase}\n\n${embDescription}`, [], false, true).setTitle(embTitle);
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('orders').setLabel('📦 Ordini').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(`positions`).setLabel('💸 Posizioni').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(`all`).setLabel('Tutto').setStyle(ButtonStyle.Primary)
        );
        const _close = async (i, includeOrders = true, includePositions = true) => {
            const selectionDelay = 20;
            const pers = await this.updateGPPersistence(false, interaction.user.id);
            const orders = includeOrders && pers.orders.length ? `\n**Orders**\n${pers.orders.map(ticket => ticket.name).join('\n')}\n` : '';
            const positions = includePositions && pers.positions.length ? `\n**Positions**\n${pers.positions.map(ticket => ticket.name).join('\n')}\n` : '';
            if ((!includePositions && !orders) || (!includeOrders && !positions) || (!orders && !positions)) {
                await i.update({ embeds: [this.makeExeStatusEmbed(1, 'No order or position on this account')], components: [], ephemeral: true });
                setTimeout(() => { try { i.deleteReply() } catch (e) { error('Cannot delete reply, maybe someone did. ' + e) } }, 1000 * 60);
                return;
            }
            const embTitle = 'Chiudere i seguenti tickets?';
            const timerPhrase = `\nIl comando si annulla <t:${Math.floor(Date.now() / 1000) + selectionDelay + 1}:R>`;
            const embDescription = 'Se confermi i seguenti tickets veranno eliminati:' + timerPhrase + '\n' + orders + positions;
            const emb = this.makeExeStatusEmbed(1, embDescription, [], false, true).setTitle(embTitle);//.setFooter({ text: '• security action' });
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('ok').setLabel('Confermo').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId(`abort`).setLabel('Annulla').setStyle(ButtonStyle.Danger),
            );
            const reply = await i.update({ embeds: [emb], components: [row], ephemeral: true });
            timeout = setTimeout(() => {
                try {
                    i.editReply({ embeds: [this.makeExeStatusEmbed(-1, `Operazione scaduta.`, [], true, true)], components: [] });
                    setTimeout(() => { try { i.deleteReply() } catch (e) { error('Cannot delete reply, maybe someone did. ' + e) } }, 1000 * 60);
                } catch (e) { error('Error during update message -> ' + e) }
            }, 1000 * selectionDelay);
            const f_button = (i) => i.user.id === user.id;
            reply.createMessageComponentCollector({ f_button, max: 1 })
                .on('collect', async i => {
                    clearTimeout(timeout);
                    switch (i.customId) {
                        case 'ok':
                            res = await GoldPot.delete(null, interaction.user.id, includeOrders, includePositions);
                            i.update({ embeds: [this.makeExeStatusEmbed(res.code, res.message, res.errors)], components: [] });
                            break;
                        case 'abort': i.update({ embeds: [this.makeExeStatusEmbed(0, `Operazione annullata.`)], components: [] }); break;
                    }
                    setTimeout(() => { try { i.deleteReply() } catch (e) { error(e) } }, 1000 * 60);
                });
        };

        var message = await interaction.reply({ embeds: [emb], components: [row], ephemeral: true });
        timeout = setTimeout(() => {
            try {
                interaction.editReply({ embeds: [this.makeExeStatusEmbed(-1, `Operazione scaduta.`, [], true, true)], components: [] });
                setTimeout(() => { try { interaction.deleteReply() } catch (e) { error('Cannot delete reply, maybe someone did. ' + e) } }, 1000 * 60);
            } catch (e) { error(e); }
        }, 1000 * selectionDelay);

        const f_button = (i) => i.user.id === user.id;
        message.createMessageComponentCollector({ f_button, max: 1 })
            .on('collect', async i => {
                clearTimeout(timeout);
                switch (i.customId) {
                    case 'all': _close(i); break;
                    case 'orders': _close(i, true, false); break;
                    case 'positions': _close(i, false, true); break;
                }
            });
    }
}

const { ChannelType, AttachmentBuilder, EmbedBuilder, RESTJSONErrorCodes } = require('discord.js');
const { FgYellow, success, color, error, warn } = require('./logger');
const relationData = require(`./persistence/idRelationsForReply.json`);
const cors = require('cors');
const utils = require(`./utils`);
const express = require('express');

const app = express();
const port = 3000;
const moment = require('moment');
const channelRelations = require('./config/channelsRelations');
const userRelations = require('./config/userRelations');



app.use(cors());
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true })); // https://stackoverflow.com/questions/24330014/bodyparser-is-deprecated-express-4

const _buildAttachments = (base64, ext = 'png', fileName = 'media') => {
    const dataFile = base64;
    const buf = new Buffer.from(dataFile, 'base64');
    return new AttachmentBuilder(buf, { name: `${fileName}.${ext}` });
};

module.exports = {
    start(guild) {
        if (!guild) return;
        app.listen(port, () => { success(`Dawson listening on port ${color(port, FgYellow)}!`); this.postHandler(guild) });
    },
    async postHandler(guild) {
        app.post('/', async (req, res) => {
            if (!guild) {
                error('Bot guild not found');
                return;
            };

            if (!req.body) { error('Error while reading the req body'); return };

            //#region HANDLE REQUEST BODY
            var postData = req.body || JSON.parse(req.body);
            var discordChannelID = channelRelations.get(postData.chat.id);
            var message = postData.message.text || "";
            var tgMessageID = postData.message.id || '';
            var tgReplyID = postData.message.reply_to || '';
            var publisher = postData.chat.from_user || '';
            var msgTime = postData.message.time && moment(postData.message.time).format('HH:mm');
            var pfpBase64 = postData.chat.photo && postData.chat.photo.b64 || null;
            var pfpExt = postData.chat.photo && postData.chat.photo.ext || null;
            var attachBase64 = postData.attach.data && postData.attach.data.b64 || null;
            var attachExt = postData.attach.data && postData.attach.data.ext || null;
            attachExt = 'oga' === attachExt ? 'mp3' : attachExt; // Pyhton traduce i vocali da telegram in .oga, in quel caso li rimetto in mp3 per poterli riprodurre in Discord una volta pubblicati
            //#endregion

            //#region CREATE MESSAGE EMBEDED
            var attachedFiles = [];
            var messageFooter = `\n\n\`Message IDs -> own=${tgMessageID}, reply=${tgReplyID}\``;
            const messageEmbed = new EmbedBuilder()
                .setColor(message.toLowerCase().indexOf('buy') > -1 ? '#26A69A' : message.toLowerCase().indexOf('sell') > -1 ? '#EF5350' : '#2962FF')
                .setDescription(message + messageFooter)
                .setAuthor({ name: publisher.username })
                .setImage(`attachment://img.${attachExt}`)
                .setThumbnail(`attachment://thumb.${pfpExt}`);
            // .setTimestamp();

            //? If message comes with a file attached
            if (attachBase64 && attachExt) attachedFiles.push(_buildAttachments(attachBase64, attachExt, 'img'));
            //? If message comes with a profile/group/channel picture
            if (pfpBase64 && pfpExt) attachedFiles.push(_buildAttachments(pfpBase64, pfpExt, 'thumb'));
            //#endregion

            try {
                if (!discordChannelID) { warn(`No discord channel relation for ID -> ${postData.entity_id}`); return; }
                //? GET THE CHANNEL
                var channel = await guild.channels.fetch(discordChannelID);

                // //? GETTING RELATED DISCORD MESSAGE ID
                var discordReplyPers = relationData[discordChannelID] && relationData[discordChannelID].find(msg => msg.tgMessageID === tgReplyID);
                var discordReplyID = tgReplyID && discordReplyPers ? discordReplyPers.discordMessageID : null;
                var messageToReply = discordReplyID ? await channel.messages.fetch(discordReplyID) : null;

                // Easy check to very the channel is not a vocal type
                if (channel.type == ChannelType.GuildVoice) return;
                messageEmbed.setFooter({
                    text: msgTime + (tgReplyID && !messageToReply
                        ? ` • Unable to retrieve ${tgMessageID === tgReplyID ? "original modified message." : "message to reply to."}`
                        : '')
                });
                
                var resMessage;
                try {
                    //? SEND/REPLY THE MESSAGE TO THE CHANNEL
                    resMessage = messageToReply
                    ? await messageToReply.reply({ embeds: [messageEmbed], files: attachedFiles }) // IF IT'S A REPLY
                    : await channel.send({ embeds: [messageEmbed], files: attachedFiles }); // NORMAL SEND

                } catch (e) {
                    //? SEND/REPLY THE MESSAGE TO THE CHANNEL WITH ERROR
                    var emb = utils.makeExeStatusEmbed(-1, `${e.code}: ${e.message}`);
                    resMessage = messageToReply
                    ? await messageToReply.reply({ embeds: [emb]}) // IF IT'S A REPLY
                    : await channel.send({ embeds: [emb] }); // NORMAL SEND
                }

                if (!resMessage) { res.status(200).send('Empty response after .reply() or .send(). server-service'); return; };

                //? SAVE MESSAGE FOR REPLY PERSISTENCE
                utils.tgDsRelationsHandler(resMessage, tgMessageID);
                success(`Message successfully relayed to discord channel ${channel.name}`);

                //? ANSWER BACK TO PAECY
                // res.status(200).send(200); //TODO: maybe it's better res.send(200);
                res.sendStatus(200);

            } catch (e) {
                error(e);
                // message = e.code === RESTJSONErrorCodes.RequestEntityTooLarge ? 'Request entity too large' : 'Error';
                // res.status(200).send(message);
                res.status(200);
            }
        });

        app.post('/op_process', async (req, res) => {
            res.setHeader('Content-Type', 'application/json');
            if (!guild) {
                error('Bot guild not found');
                res.status(200).json({});
                return;
            };

            if (!req.body) { error('Error while reading the req body'); res.status(200); return };

            const data = req.body || JSON.parse(req.body);

            if (!data) {
                message = `'data' from request was null or in wrong format -> ${data}`;
                error(message);
                res.status(200).json({ message });
                return;
            }

            const code = data.code != null ? data.code : 1;
            const message = data.message || '';
            const strategy = data.strategy || '';
            const port = data.port_identity || '';

            try {
                const channel = await guild.channels.fetch(userRelations.getProcessChannel(strategy, port));
                if (!channel || channel.type == ChannelType.GuildVoice) return;
                const resMessage = await channel.send({ embeds: [utils.makeExeStatusEmbed(code, message, [], false)] }); // NORMAL SEND
                if (!resMessage) { res.status(200).send('Empty response after .reply() or .send(). server-service'); return; };
                success(`Process successfully relayed to discord channel ${channel.name}`);
                res.status(200).json({ code: 0, message: 'OK' });
            } catch (e) { error(e); res.status(200).json({}); return; }

        });
    }
}
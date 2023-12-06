const { Channels, Signals } = require('../data/channels-id');

const ChannelRelations = {
    // From Davy Jones (Telegram Relay)
    "0": Signals.miscellaneous,
    "-1001333529389": Signals.helawi,
    "-1001396749956": Signals.fxCartel,
    "-1001214499806": Signals.fxChat,
    "-1001345264557": Signals.blueForex,
    "-624547381": Signals.goldpotMainProductionRelease,
    // From Discord2Discord (Discord Relay)
    "1059742846376235108": Signals.fenixTr,
    "1059743119593197618": Signals.sherlockTr
};
module.exports = {
    //TODO: remembre to remove todelete, if u want
    get: (tgID) => { return ChannelRelations[tgID + ''] || Signals.miscellaneous } // Change Channels.todelete with whatever
};
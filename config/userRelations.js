const { Users } = require('../data/user-id');
const { Channels } = require('../data/channels-id');

const UserRelations = {
    [Users.Diego]: {
        mt5Relations: ['4000', '4002'],
        process_xau_usd: '1072893935233536000',
        process_blue_forex: '1072894524520677396',
        process_fenix_tr: '1128227846683365407'
    },
    [Users.Dylan]: {
        mt5Relations: ['4000'],
        process_xau_usd: '',
        process_blue_forex: '',
        process_fenix_tr: ''
    },
    [Users.Shogun]: {
        mt5Relations: ['4000'],
        process_xau_usd: '',
        process_blue_forex: '',
        process_fenix_tr: ''
    },
    [Users.Nico]: {
        mt5Relations: ['4001'],
        process_xau_usd: '',
        process_blue_forex: '1082113029606477886',
        process_fenix_tr: ''
    },
    [Users.Eriklando]: {
        mt5Relations: ['4003'],
        process_xau_usd: '1076541513280004188',
        process_blue_forex: '',
        process_fenix_tr: ''
    }
};
module.exports = {
    getMT5Relation: (user) => { return (UserRelations[user].mt5Relations.length && UserRelations[user].mt5Relations[0]) || null; },
    getProcessChannel: (strategy, port) => {
        const userId = Object.keys(UserRelations).find(user => !!UserRelations[user].mt5Relations.find(p => p === port + ''));
        return UserRelations[userId][`process_${strategy}`] || Channels.todelete;
    },
};
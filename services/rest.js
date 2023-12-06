const { host } = require('../config.json');
const fetch = require('node-fetch');
const { error } = require('../logger');
const userRelation = require('../config/userRelations');

module.exports = {
    GoldPot: {
        async getStatus(userID) { return await _callApi(`get_status`, userID) },
        async delete(mainID, userID, orders = true, positions = true) { return await _callApi(`delete${orders && positions ? '' : orders ? '/orders' : positions ? '/positions' : ''}${(mainID && ('/' + encodeURIComponent(mainID))) || ''}`, userID) },
        async getConfigInfo(userID) { return await _callApi(`get_config_info`, userID); },
        async setVolume(volume, userID, strategy = 'all') {
            if (!(typeof volume == 'number')) return;
            return await _callApi(`set_volume/${strategy}/${volume.toFixed(2)}`, userID);
        },
    }
}

const _callApi = async (url, userID, method = 'GET', body = {}) => {
    try {
        port = userRelation.getMT5Relation(userID);
        if (!port) { error('No port found for user ' + userID); return; }
        url = `http://${host}:${port}/v1/${url}`;
        body = JSON.stringify(body);
        const headers = { 'Content-Type': 'application/json' }
        const res = method.toUpperCase() === 'GET' ? await fetch(url, { method, headers }) : await fetch(url, { method, headers, body });
        return await res.json();
    } catch (e) { error(e); return { code: -1, message: e }; }
}
module.exports = {
    OrderTypes: {
        ORDER_TYPE_BUY: 0,
        ORDER_TYPE_SELL: 1,
        ORDER_TYPE_BUY_LIMIT: 2,
        ORDER_TYPE_SELL_LIMIT: 3,
        ORDER_TYPE_BUY_STOP: 4,
        ORDER_TYPE_SELL_STOP: 5,
        ORDER_TYPE_BUY_STOP_LIMIT: 6,
        ORDER_TYPE_SELL_STOP_LIMIT: 7,
    } ,
    PositionTypes: {
        POSITION_TYPE_BUY : 0 ,
        POSITION_TYPE_SELL: 1 ,   
    },
    fromValue: (num) => {
        switch(num){
            case 0: res = 'buy'; break;
            case 1: res = 'sell'; break;
            case 2: res = 'buy limit'; break;
            case 3: res = 'sell limit'; break;
            case 4: res = 'buy stop'; break;
            case 5: res = 'sell stop'; break;
            case 6: res = 'buy stop limit'; break;
            case 7: res = 'sell stop limit'; break;
        } return res;
    }
};
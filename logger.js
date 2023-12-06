const moment = require('moment');
const path = require('path');

// CONSOLE COLORS
module.exports = {
    Reset: "\x1b[0m",
    Bright: "\x1b[1m",
    Dim: "\x1b[2m",
    Underscore: "\x1b[4m",
    Blink: "\x1b[5m",
    Reverse: "\x1b[7m",
    Hidden: "\x1b[8m",

    FgBlack: "\x1b[30m",
    FgRed: "\x1b[31m",
    FgGreen: "\x1b[32m",
    FgYellow: "\x1b[33m",
    FgBlue: "\x1b[34m",
    FgMagenta: "\x1b[35m",
    FgCyan: "\x1b[36m",
    FgWhite: "\x1b[37m",

    BgBlack: "\x1b[40m",
    BgRed: "\x1b[41m",
    BgGreen: "\x1b[42m",
    BgYellow: "\x1b[43m",
    BgBlue: "\x1b[44m",
    BgMagenta: "\x1b[45m",
    BgCyan: "\x1b[46m",
    BgWhite: "\x1b[47m",

    info(msg, color='\x1b[34m'){_log(`${color}i\x1b[0m` , `${msg}`); },
    warn(msg, color='\x1b[33m'){_log(`${color}⚠\x1b[0m` , `${msg}`); },
    error(msg, color='\x1b[31m'){_log(`${color}✘\x1b[0m` , `${msg}`); },
    success(msg, color='\x1b[32m'){_log(`${color}✔\x1b[0m` , `${msg}`); },
    color(msg, color='\x1b[0m'){ return `${color}${msg}\x1b[0m`;}
}

var prevLog = '';
var counter = 1;

const _log = (prefix, message) => {
    const callerLineP = new Error().stack.split('\n')[3];
    const callerLine = new Error().stack.split('\n')[2];
    const [, file, line] = /\((.*):(\d+):\d+\)$/.exec(callerLineP) || [];
    const now = new Date();
    const time = moment(now).format('YYYY-MM-DD HH:mm:ss')
    const relativePath = file ? path.relative(process.cwd(), file) : '';
    var logText = '';
    if (message === prevLog) {
        process.stdout.write("\x1b[1F");
        process.stdout.write("\x1b[2K");
        logText = `(${++counter}) ${prefix} \x1b[2m${time}\x1b[0m ${message} ` + (relativePath? `\x1b[2m(${relativePath}:${line||''})\x1b[0m`: '');;
    } else {
        prevLog = message;
        counter = 1;
        logText = `${prefix} \x1b[2m${time}\x1b[0m ${message} ` + (relativePath? `\x1b[2m(${relativePath}:${line||''})\x1b[0m`: '');
    } 
    console.log(logText);
}

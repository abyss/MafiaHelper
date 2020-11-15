const bot = require('../../../bot');
const { send } = require('../../../utils/chat');
const moment = require('moment');
require('moment-duration-format');

exports.run = async (msg) => {
    let timer = await bot.db.get('mafia', 'timer');
    const phase = await bot.db.get('mafia', 'phase');
    let output;

    if (phase === 'dusk') {
        // Dusk
        output = ':cityscape:  **|  It is currently Dusk. The Night Phase will begin when a Mod starts it.**';
    } else if (phase === 'dawn') {
        // Dawn (yes the emoji is dusk but it looks good for Dawn)
        output = ':city_dusk:  **|  It is currently Dawn. The Day Phase will begin when a Mod starts it.**';
    } else {
        const now = moment();
        timer = moment(timer);
        const diff = moment.duration(timer.diff(now));

        const timeLeft = moment
            .duration(diff)
            .format('d [days], h [hours], m [minutes], [and] s [seconds]');

        if (phase === 'day') {
            output = `:sunny:  **|  The Day Phase will end in ${timeLeft}.**`;
        } else if (phase === 'night') {
            output = `:full_moon:  **|  The Night Phase will end in ${timeLeft}.**`;
        } else {
            output = ':x:  **|  There is currently no game running.**';
        }
    }

    await send(msg.channel, output);
};

// Usage is a Map where each key is the usage, and the value is the description
exports.usage = new Map([
    ['', 'Checks the current time left']
]);

exports.config = {
    name: 'timeleft',
    cmd: 'timeleft',
    alias: [],
    // Permissions use https://discord.js.org/#/docs/main/stable/class/Permissions?scrollTo=s-FLAGS
    // or NOONE - which rejects everyone.
    botPermissions: [], // Guild permissions needed by the bot to use this command.
    defaultPermissions: [], // Default permissions to use this command by user
    location: 'ALL', // 'GUILD_ONLY', 'DM_ONLY', 'ALL' - where the command can be used
    description: 'Checks the current time left.',
    debug: false // If true: unusable to anyone besides process.env.OWNER
};

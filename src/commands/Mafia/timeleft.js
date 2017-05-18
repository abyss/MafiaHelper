exports.run = function (bot, msg) {
    let phase = bot.mafia.data.phase;
    let toTimer = bot.mafia.timeToTimer();

    if (phase === 1) {
        // Dawn
        msg.channel.send(':city_dusk:  **|  It is currently Dawn. The Day Phase will begin when a Mod starts it.**');
    } else if (phase === 2) {
        // Day
        msg.channel.send(`:sunny:  **|  The Day Phase will end in ${toTimer}.**`);
    } else if (phase === 3) {
        // Dusk
        msg.channel.send(':cityscape:  **|  It is currently Dusk. The Night Phase will begin when a Mod starts it.**');
    } else if (phase === 4) {
        // Night
        msg.channel.send(`:full_moon:  **|  The Night Phase will end in ${toTimer}.**`);
    } else {
        // Unsupported Phase
        msg.channel.send(':x:  **|  There is currently no game running.**');
    }
};

exports.info = {
    name: 'timeleft',
    usage: 'timeleft',
    description: 'Checks time left in day.'
};

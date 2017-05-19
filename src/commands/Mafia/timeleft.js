exports.run = function (bot, msg) {
    let phase = bot.mafia.data.phase;
    let toTimer = bot.mafia.timeToTimer();
    let output;

    if (phase === 1) {
        // Dawn
        output = ':city_dusk:  **|  It is currently Dawn. The Day Phase will begin when a Mod starts it.**';
    } else if (phase === 2) {
        // Day
        output = `:sunny:  **|  The Day Phase will end in ${toTimer}.**`;
    } else if (phase === 3) {
        // Dusk
        output = ':cityscape:  **|  It is currently Dusk. The Night Phase will begin when a Mod starts it.**';
    } else if (phase === 4) {
        // Night
        output = `:full_moon:  **|  The Night Phase will end in ${toTimer}.**`;
    } else {
        // Unsupported Phase
        output = ':x:  **|  There is currently no game running.**';
    }

    msg.channel.send(output);
};

exports.info = {
    name: 'timeleft',
    usage: 'timeleft',
    description: 'Checks time left in day.'
};

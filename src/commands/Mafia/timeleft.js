exports.run = function (bot, msg) {
    let toEOD = bot.mafia.timeToEOD();

    if (toEOD) {
        msg.channel.send(`:white_sun_cloud:  **|  The Day Phase will end in ${toEOD}.**`);
    } else {
        msg.channel.send(':x:  **|  There is no Day Phase currently.**');
    }
};

exports.info = {
    name: 'timeleft',
    usage: 'timeleft',
    description: 'Checks time left in day.'
};

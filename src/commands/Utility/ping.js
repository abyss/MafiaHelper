exports.run = (bot, msg) => {
    msg.channel.send(':watch: **Pong!**').then(m => {
        let time = m.createdTimestamp - msg.createdTimestamp;
        m.edit(` :watch: **Pong!** \`${time}ms\``);
    });
};

exports.info = {
    name: 'ping',
    usage: 'ping',
    description: 'Pings the bot'
};
const bot = require('../../bot');
const { send } = require('../../utils/chat');
const moment = require('moment');

exports.config = {
    name: 'Mafia',
    enabled: true, // Module enabled on servers by default
    description: 'Running Mafia Games!',
    debug: false // Commands are only usable by owner
};

exports.timer = undefined;

async function gameLoop() {
    let phase = await bot.db.get('mafia', 'phase');
    let timer = await bot.db.get('mafia', 'timer');
    if (timer) timer = moment(timer);

    if (!(timer && phase)) { return; }
    if (!(phase === 'day' || phase === 'night')) { return; }

    if (timer.isBefore()) {
        if (phase === 'day') {
            await bot.db.set('mafia', 'timer', null);
            await bot.db.set('mafia', 'phase', 'dusk');

            const main = await bot.db.get('mafia', 'main');

            const guildId = main.server;
            const guild = bot.client.guilds.resolve(guildId);

            const channelId = main.channel;
            const channel = guild.channels.resolve(channelId);

            const playerRole = main.role;
            const opts = { 'SEND_MESSAGES': false };
            const reason = 'MafiaHelper: Day end';

            const message = ':exclamation:  **|  Majority was not reached before the end of the Day, so no one has been lynched.**\n\n:cityscape:  **|  It is currently Dusk. The Night Phase will begin when a Mod starts it.**';
            await send(channel, message);

            try {
                await channel.updateOverwrite(playerRole, opts, reason);
            } catch (err) {
                console.log(err);
                send(channel, 'Error: Does the bot have permissions over this channel?');
            }
        } else if (phase === 'night') {
            await bot.db.set('mafia', 'timer', null);
            await bot.db.set('mafia', 'phase', 'dawn');

            const mafia = await bot.db.get('mafia', 'mafia');
            const mason = await bot.db.get('mafia', 'mason');

            const mafiaGuildId = mafia.server;
            const mafiaGuild = bot.client.guilds.resolve(mafiaGuildId);

            const masonGuildId = mason.server;
            const masonGuild = bot.client.guilds.resolve(masonGuildId);

            const mafiaChannelId = mafia.channel;
            const mafiaChannel = mafiaGuild.channels.resolve(mafiaChannelId);

            const masonChannelId = mason.channel;
            const masonChannel = masonGuild.channels.resolve(masonChannelId);

            const mafiaRole = mafia.role;
            const masonRole = mason.role;

            const opts = { 'SEND_MESSAGES': false };
            const reason = 'MafiaHelper: Night end';

            try {
                await mafiaChannel.updateOverwrite(mafiaRole, opts, reason);
                await masonChannel.updateOverwrite(masonRole, opts, reason);
            } catch (err) {
                console.log(err);
                send(mafiaChannel, 'Error: Does the bot have permissions over the channels?');
            }

            const message = ':exclamation:  **|  The Night Phase has ended.**\n\n:city_dusk:  **|  It is currently Dawn. The Day Phase will begin when a Mod starts it.**';
            await send(mafiaChannel, message);
            await send(masonChannel, message);
        }
    }
}

bot.client.on('ready', () => {
    bot.client.setInterval(gameLoop, 5000);
});

// bot.client.on('messageUpdate', async (oldMsg, newMsg) => {
//     // TODO: Monitor Message Edits in Appropriate Channels

//     if (oldMsg.author.bot) return;
//     if (oldMsg.content === newMsg.content) return; // Embeds call a messageUpdate when embedding, it seems.

//     // if !monitored channel return;
//     // if mod return;

//     const output = [];
//     sendMods(output.join('\n'));
// });

// bot.client.on('messageDelete', async msg => {
//     // TODO: Monitor Message Deletes in Appropriate Channels

//     if (msg.author.bot) return;
//     // if mod return;

//     // notify mods
// });

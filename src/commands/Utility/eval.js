exports.run = (bot, msg, args) => {
    if (msg.author.id !== bot.config.owner) {
        msg.channel.send(`:negative_squared_cross_mark:  |  You are not <@${bot.config.owner}>.`);
        return;
    }

    let parsed = bot.utils.parseArgs(args, ['l:']);
    let lang = parsed.options.l || '';

    let code = parsed.leftover.join(' ');

    try {
        let evaled = eval(code);
        if (typeof evaled !== 'string')
            evaled = require('util').inspect(evaled);
        msg.channel.sendMessage(`\`\`\`${lang}\n${clean(evaled)}\n\`\`\``);
    } catch (err) {
        msg.channel.sendMessage(`:x: Error! \`\`\`xl\n${clean(err)}\n\`\`\``).then(m => m.delete(15000));
    }
};

function clean(text) {
    if (typeof (text) === 'string') {
        return text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203));
    }
    else {
        return text;
    }
}

exports.info = {
    name: 'eval',
    usage: 'eval <code>',
    description: 'Evaluates arbitrary JavaScript'
};

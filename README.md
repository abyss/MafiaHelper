# SharpCore
SharpCore is a userbot core for [Discord](http://discordapp.com) with [discord.js](https://discord.js.org). It doesn't have much use by itself, and will need commands and features added as you wish for your own bot.

It is based on SharpBot by Rayzr522, which you can find [here](https://github.com/Rayzr522/SharpBot).

#### Table of contents
- [Requirements](#requirements)
- [Installing](#installing)
- [Running](#running)
- [Discord Bot Best Practices](#best-practices)
- [Credits](#credits)
- [Support](#support)
- [Pull Requests](#pull-requests)
- [License](#license)

## Usage
### Requirements
- `git`
- [`node`](https://nodejs.org)
- [`yarn`](https://yarnpkg.com/docs/install) (Recommended)

If you have `npm` but not `yarn`, you'll want to check it out. If not, it is up to you to figure out the appropriate `npm` commands.

> "Yarn is faster and more reliable." - [Rayzr522](https://github.com/Rayzr522)

### Installing

```bash
git clone https://github.com/abyssvi/SharpCore.git
cd SharpCore
yarn
```

- Rename `config.json.example` in the `src` folder to `config.json`
- Edit `config.json` and enter your user-token (Obtain one [here](https://discordapp.com/developers/applications/me))

### Running
Assuming you have set up the config file with the user-token, just do `yarn start` to run the bot.

To invite the bot to your server, you will need to visit the following link: `https://discordapp.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&scope=bot&permissions=PERMISSIONS`

`YOUR_CLIENT_ID` should be your bot's Client ID, and `PERMISSIONS` number can be calculated [here](https://discordapi.com/permissions.html).


### Discord Bot Best Practices
You should really read the best practices published by meew0, found [here](https://github.com/meew0/discord-bot-best-practices). This bot attempts to obey all of them, and all derivatives should too.

## Credits
[SharpBot](https://github.com/Rayzr522/SharpBot) was originally a modified version of [eslachance's djs-selfbot-v9](https://github.com/eslachance/djs-selfbot-v9), but over time Rayzr completely rewrote it. 

I took SharpBot and stripped all of the self-bot specific code, and modified it for UserBots to make SharpCore.

## Support
Please understand that if you do not understand NodeJS and Javascript, this bot will be very little use to you. It is not meant to be run as-is, but instead modified as a base for future projects.

If you do need some help, think you have a good feature request, or just want to chat, you can join RayzrDev's Discord server: [https://discord.io/rayzrdevofficial](https://discord.io/rayzrdevofficial).

## Pull Requests
If you want to submit a pull request, feel free. Please make sure your code passes ESLint with no extra warnings or errors, and understand I reserve the right to ask you to resubmit with changes.

## License
Continuing the tradition of all ancestor bots, this code is released under the MIT license. You can find a copy in the [LICENSE](LICENSE) file.
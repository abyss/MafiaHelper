# MafiaHelper
MafiaHelper is a bot for assisting with running games of Mafia on a Discord server. Your games will still need a moderator. It handles phases of the game (Day and Night, and intermediate phases Dawn and Dusk), voting for lynches, and ending day/night at the end of timer, or ending day when a lynch majority has been reached.

It's fairly simple, and it runs regularly on my server for the Mafia games we run there.

#### Table of contents
- [Requirements](#requirements)
- [Installing](#installing)
- [Running](#running)
- [Discord Bot Best Practices](#best-practices)
- [Support](#support)
- [Pull Requests](#pull-requests)
- [License](#license)

## Usage
### Requirements
- [`node`](https://nodejs.org)
- [`yarn`](https://yarnpkg.com/docs/install) (Recommended)

If you have `npm` but not `yarn`, you'll want to check it out. If not, it is up to you to figure out the appropriate `npm` commands.

> "Yarn is faster and more reliable." - [Rayzr522](https://github.com/Rayzr522)

### Installing

```bash
git clone https://github.com/abyssvi/MafiaHelper.git
cd MafiaHelper
yarn
```

- Rename `config.json.example` in the `src` folder to `config.json`
- Edit `config.json` and enter your user-token (Obtain one [here](https://discordapp.com/developers/applications/me))

### Running
#### Configuration
Assuming you have set up the config file with the user-token, just do `yarn start` to run the bot.

To invite the bot to your server, you will need to visit the following link: `https://discordapp.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&scope=bot&permissions=PERMISSIONS`

`YOUR_CLIENT_ID` should be your bot's Client ID, and `PERMISSIONS` number can be calculated [here](https://discordapi.com/permissions.html).

#### In Discord
There are various commands you will need to run to start a game. An admin of a server will need to run the `mod` command and tag someone to add them as a moderator. Then a mod or admin will need to `startgame` and tag a player role for the game. This command must be run in the channel, and server, of the main game chat. Following that, you will need to run `setmafia` tagging the mafia player role, in the mafia server and night chat channel. I strongly recommend this be on another server, for obvious reasons.

Once those are setup, all you need to do is `startnight` or `startday` in either channel. You may pass an optimal hours, but by default day will be 24 hours, and night will be 12 hours.

If you're serious about running this yourself, feel free to reach out to me and I can help you get this set up for your games. I don't truly expect anyone to want to.

### Discord Bot Best Practices
You should really read the best practices published by meew0, found [here](https://github.com/meew0/discord-bot-best-practices). This bot attempts to obey all of them, and all derivatives should too.

## Support
If you decide to run this and need help, feel free to contact me on Discord, Abyss#0473 or post an issue here.

## Pull Requests
If you want to submit a pull request, feel free. Please make sure your code passes ESLint with no extra warnings or errors, and understand I reserve the right to ask you to resubmit with changes. I'd suggest talking with me on Discord about any potential PRs to save you time.

## License
Continuing the tradition of all ancestor bots, this code is released under the MIT license. You can find a copy in the [LICENSE](LICENSE) file.

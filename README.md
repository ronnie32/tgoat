<p align="center"><img src="docs/assets/tgoat-512.png" width="96" alt="TGoat"></p>

# TGoat

TGoat is a bot that plays your OGame accounts. It is the successor of TBot 3.6 and ogamed: one program that holds both the game client and the bot, with a web interface you open on your computer, and control from Telegram or Discord.

**Read the guide: [ronnie32.github.io/tgoat](https://ronnie32.github.io/tgoat/)**

> **Alpha: `0.1.0-alpha.1`.** Expect bugs, and back up `config/` and `data/` before each update. Using a bot breaks OGame's rules (Gameforge's terms of use): your account can be banned. Use it at your own risk, ideally on a secondary account, and start with every feature off.

## What it does

- **Defends** your planets: watches for attacks every 1 to 5 minutes, saves the fleet before impact, and keeps watching while you sleep.
- **Grows** your account: mines, research, lifeforms, storage and energy, each build chosen by how fast it pays back.
- **Raids** inactive players with AutoFarm, ranks targets by profit per hour, and can propose the fleet that opens a defended target, with its payback.
- **Sends** expeditions, harvests debris, colonizes and explores, and collects the Directives rewards.
- **Explains** itself: every decision comes with its reason, in the logs and the web interface.

Nearly every behaviour is a setting. A setup assistant reads your account and suggests settings that fit it; nothing is applied without your click.

## Where to start

- **New to TGoat:** [Get started](https://ronnie32.github.io/tgoat/start.html), then the [web interface](https://ronnie32.github.io/tgoat/interface.html).
- **Coming from TBot 3.6:** your settings are imported on the first start. Read [What changes for you](https://ronnie32.github.io/tgoat/from-tbot.html).
- **Looking something up:** [settings](https://ronnie32.github.io/tgoat/settings.html), [commands](https://ronnie32.github.io/tgoat/commands.html), [every change from TBot](https://ronnie32.github.io/tgoat/changes.html), [known limits](https://ronnie32.github.io/tgoat/limits.html).

## Downloads

Builds will be published on the [Releases](https://github.com/ronnie32/tgoat/releases) page. The history of each version is in [CHANGELOG.md](CHANGELOG.md).

## A note from the author

Many of TGoat's decisions come from my own reading of the game: its rules, my understanding of the meta, and how a careful player would play. I did my best with all of that, and tested in the game what could be tested. I do not promise that every decision is the best one, or that it makes sense in every situation of your account. If a choice does not suit you, the settings let you change it.

Zeus (`zeus8000` on Discord)

## Credits

TGoat's game client derives from [alaingilbert/ogame](https://github.com/alaingilbert/ogame) (MIT licence). TGoat follows TBot 3.6 (C#), whose settings it imports.

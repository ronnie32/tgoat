# Changelog

All notable changes to TGoat are written here, newest first, for players. The
format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

TGoat uses [Semantic Versioning](https://semver.org/) with a pre-release tag:
`0.1.0-alpha.1` is the first alpha of version 0.1.0. Every build handed out
bumps the alpha number (`alpha.2`, `alpha.3`, and so on).

**Alpha builds may change settings and files between versions.** Back up the
`config/` and `data/` folders before replacing the program. Upgrades between
alphas are not guaranteed to migrate your files until the first stable
release. The full guide is [docs/index.html](https://ronnie32.github.io/tgoat/index.html), and its
[Known limits](https://ronnie32.github.io/tgoat/limits.html#limits) section lists what is missing.

## [0.1.0-alpha.6] - 2026-11-24

### Added

- Telegram without hunting the chat ID: paste the token from `@BotFather`, click
  **Link Telegram** (first run, or the Telegram group of the TGoat settings),
  then open the link or scan its QR code and tap Start. TGoat saves the chat.
  The link works once, for 10 minutes. The token alone now starts the bot,
  which waits for its link; typing the chat ID still works. The guide has a
  new [Telegram section](https://ronnie32.github.io/tgoat/discord.html#telegram-bot).
- At login TGoat logs the OGame version the server runs ("Game server runs
  OGame 13.1.1"), with a warning at each login when the server runs a newer
  OGame than the one TGoat was checked against.
- `Expeditions.NightRoundReturn` (AfterWake): the night round of expeditions
  comes back 5 to 30 minutes after the wake-up, as before, or with BeforeWake
  5 to 30 minutes before it. A fleet that lands on a planet before the wake-up
  sits there while you sleep and can be raided; from a moon it is safe.
  BeforeWake needs `SleepMode.PreventIfThereAreFleets` off, or the bedtime
  would wait for the fleet.
- Offer of the day: when the game offers another container right after the
  first, TGoat buys it too, under the same rules (`MaxPriceHours`, one
  celestial's surplus). Each one is reported and notified.
- `Brain.BuyOfferOfTheDay.Honour` (off) and `KeepHonour` (0): honour points
  pay the offer of the day first, at the rate the trader page gives (100 units
  of metal per point); one celestial's surplus pays the rest. The report says
  how many honour points were spent and how many are left.
- The Defender checks for attacks sooner when a galaxy view shows your
  selected planet or moon under attack. The game says it in every galaxy view
  TGoat reads anyway; it is one more early check, never instead of the
  Defender's own.
- A warning when the galaxy view marks your account as an outlaw: for up to
  7 days every player can attack it.
- `General.AllowOutlawAttacks` (off): lets attacks, espionage and moon
  destructions on a much stronger player leave anyway, for players who attack
  stronger players on purpose. Each one logs a warning: your account then has
  no attack protection for up to 7 days.
- With `AutoFarm.ProcessAllReports`, a target that a fresh galaxy view shows
  with an espionage report AutoFarm does not know yet is judged on that
  report instead of being probed again.
- Boosters that expire: TGoat now reads when an inventory item expires, or
  when its event ends. `Brain.Boosters` uses the copy that expires first, and
  activates an expiring booster before its date instead of keeping it for
  later, even on a planet whose storage is full in its last 12 hours. When no
  planet can take it in time, you get one warning saying why. The Boosters
  report shows the date of every item that expires.
- `Notifications.OfficerEnding` (48 hours): one notification when a hired
  officer may end within that many hours, so you can extend it. The game only
  shows whole days left; TGoat narrows the end down from the pages it loads
  anyway, with no extra request. At login, TGoat lists your officers and when
  they end.

### Changed

- Removed the request shapes kept for game servers older than OGame 13.1;
  every server runs 13.1.
- AutoFarm takes the fleet slots in use and the selected planet's probes
  from the galaxy views it reads anyway: fewer ship reads before probing,
  and it stops before the game refuses a send for lack of a slot.
- AutoFarm also targets inactive players marked as outlaws (o), even under
  the newbie protection: the game removes all protection from outlaws. A
  much stronger player (s) is still never probed or attacked, and the log
  now gives the real reason: it would make your account an outlaw for 7 days.
- `/fleet spycrash` without a target never picks a buddy or a member of your
  alliance.
- `Brain.LifeformAutoMine.BuildNonEconomic` (off by default) now builds
  everything without a return up to its Max: buildings 6 to 12 that produce
  nothing, then housing and food beyond what the population needs (they cost
  metal and crystal, no deuterium). Food always stays ahead: a housing level
  goes up only once the food feeds its living space, so the population never
  starves; with housing at its Max, food goes on up to its own. Paid by the
  planet, never with a supply flight. The line says so ("BuildNonEconomic is
  on (target 74)"). Off, the Max levels are ceilings: TGoat builds only what
  pays back or is needed, and a planet with nothing to build suggests the
  option, naming what it would build first.
- `Brain.AutoMine.KeepLastField` (on): the last free field of a planet waits
  for the Terraformer, the last free field of a moon for the Lunar Base. Before,
  when the Terraformer could not be built yet (Energy Technology 12, a Nanite
  Factory, or its Max level), a mine or a storage took the field, and the
  planet could never get a Terraformer again: it needs a free field. The
  report (`last_field_kept`) says what is missing. Off: the field goes to the
  next building, as in TBot.
- A build the game does not offer is no longer ordered. TGoat reads the item
  on the build page it opens anyway for the order: when the page greys it
  out, nothing is sent, and the log line (`build_not_offered`) gives the
  game's own reason, such as "Not enough resources!" or "Requirements are not
  met". One request instead of two, and no order that no player could click.
  Facilities are now ordered from the Facilities page, where a player builds
  them.
- The night round of expeditions (`Expeditions.NightRound`) slows the fleet
  down instead of holding it longer: it holds 1 hour at the slowest speed that
  brings it back on time, and adds whole hours only when even the slowest
  speed is too short. Player guides say a delay event grows with the holding
  time and a longer holding finds nothing more, and holding burns deuterium
  every hour. Each night send names its speed, holding, departure, return and
  why; a slot that cannot be timed says what blocks it.
- The jump gate now keeps on AutoFarm's departure moons only what AutoFarm
  had away from them at once in the last 24 hours, not every combat ship.
  All probes still stay, and a moon AutoFarm has not attacked from in that
  time keeps all its cargo ships. Set
  `Brain.AutoFleetJumpGate.MinimumAmountOfShipsToBeLeftOnMoon` for what you
  always want ready there.
- AutoFarm's systems to scan are kept sorted by galaxy and system when you save them.
- AutoFarm sends attacks much faster: it reloads only the departure moon
  before each send instead of every moon, the research and the fleets.
- AutoFarm reads each espionage report as its probes land and attacks right
  away, instead of waiting for the farthest probe.
- When a feature has nothing to spend on a planet, TGoat now says why: either
  it is still learning what the Brain plans to build (first 15 minutes after
  connecting), or which build holds which resources, and which
  Brain.SpendingPriority rank to change.
- Flight times, fuel and cargo use the ship values the game shows on the
  fleet dispatch page (research, class and lifeform bonuses included).
  TGoat opens that page before every send, so from a planet's first send on
  its numbers are the game's. Its own formulas only fill in before that, or
  after a drive research, a class change or new lifeform bonuses, until the
  page is read again. Once per login, a ship whose formula differs from the
  game is logged as a warning.
- When the account's fleet dispatch page offers 5% speed steps (the game
  gives them to a General), TGoat uses them: AutoFarm, the night round of
  expeditions, the Defender's fleet-save, and the deploy and switch commands
  (0.5 to 9.5). `AutoFarm.FleetSpeed` keeps its 10 to 100 format; a value
  between two of the account's steps uses the step below and says so.
- After the last offer of the day it buys, TGoat follows what the game says:
  the wait in its text, or, when the game says there is no further offer
  today, a look after the server's midnight at a random time, instead of
  24 hours later.
- The number of useful crawlers on a planet is the one the game's resource
  settings page shows ("Crawler (Number: 0/648)"), every bonus included,
  once that page has been read; after a mine goes up it grows by the same
  amount per level. Before, a formula guessed it.
- Class bonuses come from the lifeform bonuses page, lifeform boost
  included: a Collector's production, energy and crawler bonuses, a
  Discoverer's shorter research and extra expeditions. Mines, crawlers,
  energy sources and research times are judged with them. A server that does
  not show them keeps the fixed values.
- A booster's gain uses each mine's production as the resource settings page
  shows it, when the page was read at the mine's current level.

### Fixed

- Espionage reports of OGame 13.1 now give the target player's class and
  alliance class. Every report read "no class": the combat planner and the
  breakers refused every defended target ("does not show the defender's
  player and alliance classes"), and a General's 2 extra combat levels were
  missed wherever a report shows a combat technology at 0 (AutoFarm). The
  loot share of a report no longer depends on the game's language.
- **Sign in with your browser** works when TGoat runs as administrator: Chrome
  and Edge closed at once ("the browser stopped before opening its sign-in
  window") while `tgoat login` worked. When the browser still stops, the
  message now gives its exit code, its last error lines and the likely
  cause: a launcher instead of the browser program (set `LoginBrowser`), or
  TGoat running as a Windows service without a desktop, said before any
  browser starts.
- AutoMine, LifeformAutoMine and LifeformAutoResearch now show their next
  build, on the nearest planet ("Buildings, Home" in 22 s), in the feature
  list and on the timeline. They showed their next check of the planet list
  instead ("next pass in 9 min" while a build started sooner). In the log
  that line now reads "Next check of the celestials of AutoMine in …".
- The timeline shows when a feature you turned off or on for a while goes
  back to its setting ("Directives back on"), and when the features resume
  after you played in the game.
- A brand-new account stayed stuck on the game's intro page: TGoat skipped it
  without the page token, the game ignored it and served the intro instead
  of every page. TGoat now sends the intro form as the page does.
- Lifeform buildings no longer stop a planet with "maximum levels reached"
  while housing or food is below its Max but not needed. The line names each
  building with its numbers, what would build more, and checks again at the
  interval.
- A brand-new player, not ranked yet, could not start: TGoat took the missing
  ranking line of the overview for an error. It now starts and says the
  player is not ranked yet.
- Messages to players (Defender.MessageAttacker, the player-message command)
  use the chat request of OGame 13.1. A refused message now says what the
  game answered.
- Fleet sends, target checks and recalls are sent with exactly the fields the
  game's own page sends on OGame 13.1 (loot order metal, crystal, deuterium,
  then food: never two priorities at 1). When the game refuses a recall,
  TGoat reads the fleet list again, and an error says plainly the fleet was
  not recalled.
- A booster's value (Brain.Boosters) counted the planet's whole production
  instead of the mine's base production, so it was overstated on accounts
  with production bonuses. Brain.Boosters now also puts a booster where the
  mine itself produces the most.
- With the combat planner on, targets with no fleet and no defence were held
  to the planner's report-age and profit checks: they are raided the
  ordinary way again.
- A manual auction bid is sent only once: after a network or server error
  TGoat no longer sends it again (bids add up and are never refunded).
- Flight times and fuel for the Anomaly Encounter mission (Project Orion)
  used the universe's peaceful fleet speed; the game flies it at the war
  speed, like an attack. TGoat sends no fleet to anomalies yet.
- The game's attack limit (bash limit) was ignored. When the game says a
  target has had too many attacks in 24 hours, TGoat no longer sends the
  attack and says why; it never confirms an attack past the limit. AutoFarm
  sets that position aside for 24 hours (`bash_limit_reached`), even with
  `AutoFarm.Blacklist.Active` off.
- The game's warning before an attack or espionage on a much stronger player
  ("You are about to attack a stronger player") was ignored: such a send
  made your account an outlaw for up to 7 days, open to attacks from every
  player. TGoat now refuses it and says why, whatever feature or command
  sends it. AutoFarm sets the position aside for 24 hours (`outlaw_risk`),
  and a command answers with the reason. A Defender fleet-save to a fixed
  destination on such a player tries every other way first and goes there
  only as a last resort.
- AutoFarm's battle simulations counted a General or Warrior defender's
  class bonus twice: such targets looked stronger than they are. Your own
  General bonus now also grows with your lifeform class boost, as in the game.
- Population and food were read from the tooltip rows by position: on a
  tooltip without the T2/T3 rows (OGame 13.1.1) "Hungry" took the value of
  "Bunker Space", so a planet could be seen as starving when it was not.
  They now come from the game's own numbers.
- A population that had just reached the limit of its food counted as
  starving, so its food building skipped the Brain reserve. The game only
  starves whole inhabitants above that limit; TGoat now does the same, and
  the line names how many are hungry and how many the food feeds.
- A planet with a full storage was seen as producing nothing: repatriation,
  booster value, the defence budget and wait times were wrong. The mines'
  real rate is now used, as the Empire view already gave it.
- Tier 2/3 lifeform buildings are no longer built when the game does not
  show the tier 2/3 population; it is then taken from the lifeform research
  page once read.
- Speed, fuel and cargo of a General's or Collector's ships left out the
  lifeform boost of their class bonus. They now come from the game.
- Lifeform buildings and research whose bonus the game marks as already
  maxed out (the game asks a player to confirm such a level) were still
  paid for, for nothing. LifeformAutoMine and LifeformAutoResearch now skip
  them, and the report names each one and its bonus; a building is still
  raised when another building needs it. When only such research is left,
  the reason is `lifeform_bonus_maxed`.

## [0.1.0-alpha.5] - 2026-11-19

### Added

- AutoFarm blacklists an inactive target whose storages can never hold
  enough loot. Its mines stop when a storage is full, so a raid can take at
  most the loot share of what its storages hold (or of the stock above
  them). When that is not above `AutoFarm.MinimumResources`, the target is
  blacklisted (`storage_too_small`) instead of being probed again every
  time its report expires. New setting `AutoFarm.Blacklist.StorageTooSmall`,
  on by default; a report that hides the buildings is judged as before.
  Lowering `AutoFarm.MinimumResources` under what a target's storages can
  hold, or turning the setting off, takes it off the blacklist at the next
  pass.

### Changed

- Settings: a number that can reach 10,000 or more now shows a small readout
  next to its field, grouped by thousands ("10,000,000 (10 M)"), updated as
  you type. The field and the saved value are unchanged.
- The "Game signal learned" and "Game signal not known yet" lines are now
  debug lines: they stay in the Logs page and `TGoat.log` but no longer
  show in the console.

### Fixed

- AutoFarm with the combat planner: targets were dropped as "Report still
  incomplete … still after three espionages, the last with 27 probes"
  although nothing was hidden: their reports had only been read more than
  `AutoFarm.CombatPlanner.MaxReportAgeSeconds` after the probes landed. A
  report that is too old is now probed again with the same number of
  probes, without counting as one of the three espionages. Those probes
  leave after the attacks of the pass, and the next pass comes back when
  they land, a few seconds later, to read their reports fresh. When 3 such
  espionages in a row still bring a report too old, the target is left
  until its report expires, with the real reason
  (`combat_reports_too_late`).
- AutoFarm left its fleet slots idle between rounds of espionage: once
  every slot carried probes, the pass ended and the next one came at the
  usual interval, often minutes later, although the probes were back after
  about a minute. Each espionage takes a fleet slot until its probes are
  back, so a batch larger than the free slots now goes in rounds: AutoFarm
  waits for its first probes to come back, then sends the next espionages
  of the same batch (`AutoFarm.TargetsProbedBeforeAttack`). Targets worth
  an attack get the freed slots first. With the combat planner, a round
  stops before the reports of the pass would get too old. When no slot is
  free at all, the reports that arrived are still read.
- The AutoFarm pass summary said "15 probes sent" for 15 espionage
  missions. It now says "15 espionage missions sent".
- AutoFarm page: the scanned sector showed a "GNaN" galaxy, put the targets
  in the wrong place and squeezed everything to the left when the scan
  covers several galaxies. It now shows one band per galaxy of
  `AutoFarm.ScanRange`, on a 1 to 499 axis, and the map's AutoFarm layer
  places the targets right too.
- Jump gate: "No moon has a fleet to jump" now says why for each moon, such
  as "its jump gate recharges until 21:40", instead of "no other moon can
  give its ships". The Logs page and `TGoat.log` also get one detail line
  per moon checked: what it keeps and for whom, then the ships that can jump
  and their fleet points against the smallest jump.
- The help of every `CheckIntervalMin` and `CheckIntervalMax` says that Rage
  mode, or `Pace.Checks` on Frequent, waits a tenth of it (one minute at
  least): a 31 to 33 minute pause runs about every 3 minutes there.
- Jump gate: a moon that Expeditions, AutoFarm, AutoDiscovery or
  AutoColonize send from never jumped, whatever
  `MinimumAmountOfShipsToBeLeftOnMoon` kept there, so the ships the
  expeditions brought back were never gathered. Now every moon jumps its
  surplus. It keeps what the features that send from it use there: one
  fleet for each expedition that can still leave from it, AutoFarm's probes,
  cargo and combat ships, the colony ships (discovery uses no ships). It
  also keeps the cargo ships of Brain supply flights and of its stock, and
  `MinimumAmountOfShipsToBeLeftOnMoon`: per ship type, the largest of these
  stays, and the rest jumps. The new setting
  `Brain.AutoFleetJumpGate.KeepFeatureShips` (on by default) can be turned
  off to keep only `MinimumAmountOfShipsToBeLeftOnMoon`, as in TBot.
- Boosters proposed nothing after another feature had left the game on a
  moon (a jump, an expedition): the inventory was read from that moon, where
  the game refuses every booster ("You cannot activate this item on a
  moon!"). It is now read from a planet.
- Short amounts in the web interface lost their trailing zeros: 100,000 showed
  as "1k", 250,000 as "25k" and 200 million as "2M". They now read "100k",
  "250k" and "200M".
- Game proxy: a game address typed without its `game/` folder
  (`/game/<alias>/index.php`) showed the raw game page, whose links and chat
  went to Gameforge directly. It now opens the game page through the proxy.
- AutoFarm with the combat planner planned no attack when
  `AutoFarm.CargoSurplusPercentage` was 0, or when the flight's fuel was more
  than that margin of the loot (at best a slower attack, sometimes with a
  much larger escort): the cargo ships are now sized for the loot and the
  fuel. The last check before sending, which adds spare escort ships, also
  adds the cargo ships their fuel needs, never those kept by
  `AutoFarm.MinCargosToKeep`, instead of slowing the attack down.

## [0.1.0-alpha.4] - 2026-11-18

### Added

- Share profiles. Export a profile, or an instance's current settings, as a
  `TGOAT1-` code or a `.tgoat-profile.json` file; `/profile export <name>` on
  Telegram and Discord sends the code. Only settings that differ from the
  defaults are shared. Coordinates become places (A, B, …: "a moon, used for
  AutoFarm departure"), and a farming range becomes "50 systems around place
  A". Sleep times, trusted players, titles and anything of your account are
  never shared.
- Import a profile from a code or a file, with a preview first: pick one of
  your celestials for each place (one is suggested), what it would change on
  the instance you pick, what is left out and why, warnings when it
  was made for another class or speed, and what the setup assistant would
  change. It creates a new profile and never changes an instance unless you
  ask to use it now.
- Community library of shared profiles, with no account: browse, search,
  vote, report and publish your own. TGoat contacts it only when you use it.
  New settings `Community.Mode` (On) and `Community.URL`.
- Web interface for sharing: Export…, Share… and Import a profile… on the
  Instances page (and Export… and Share… at the top of a profile in
  Settings), Export settings… on each account card, the Community profiles
  section under Profiles, and the same in the Commands palette.
- Check for updates now: a button in the update banner, in the Updates section
  of the TGoat settings and in the Commands palette looks for a new version
  straight away, instead of waiting up to 6 hours. It runs the same signed
  check, at most once a minute.
- Logs page: coordinates, setting names, durations, clock times and proposal
  numbers in a message can be pointed at, tapped or reached with Tab. A card
  shows what TGoat knows (a planet's resources, ships and builds; a setting's
  value and help; the time a duration stands for, counting down). A click
  opens the map or the setting, and a line with a waiting proposal has an
  Accept button.

### Changed

- Setup assistant: a new question asks whether TGoat should sleep while you
  are away at night, filled in from your Sleep mode setting. Answer No and it
  turns Sleep mode off and suggests no sleep hours, night fleet-save or night
  round; before, being away at night always meant sleeping.
- Expeditions and explorations no longer wait for a wave by default: a free
  slot is filled at the next check, in Human mode too, instead of staying
  empty for up to an hour. Waves are now an option, off by default: turn
  `Pace.Waves` on to keep them (Human and Custom modes; Rage never waits).
  A settings file that already sets `Pace.Waves` to true keeps its waves.
- A readable console: long messages wrap to the window instead of running
  under the time, with the action first and each reason below it (↳). Every
  message starts at the same column, long feature names are shortened
  (LF Research, DailyOffer…), the instance name shows only when more than
  one instance runs, and coordinates, numbers, durations and setting names
  are in bold. `TGoat.log`, a redirected console and the Logs page keep one
  line per message. The Logs page uses the same short names, names the
  instance only when there are several, and its sender column is no wider
  than they need. Its attribute chips moved to the detail of a line, so the
  message takes the whole width; **Attributes** in the bar brings them back.

### Fixed

- The Deck page opens again: since 0.1.0-alpha.1 it stayed empty, because
  the update notice had no place to go on that page.

## [0.1.0-alpha.3] - 2026-11-18

### Fixed

- AutoDiscovery works again on servers older than one year, where OGame
  removed the daily limit on discoveries in November 2026: the galaxy view's
  counter now reads "used/∞", which TGoat read as unreadable and sent no
  discovery. Your Discovery settings and its daily budget still limit what it
  sends.

## [0.1.0-alpha.2] - 2026-11-18

### Added

- `AutoFarm.DeleteReports` (on by default): turn it off to keep your
  espionage reports. AutoFarm still reads them but deletes none.
- Passkeys for the web interface. In Settings, section Web interface, add
  one or more passkeys (phone, Windows Hello, password manager, security
  key) with your password and, if it is on, the authenticator code. After
  the password, the sign-in page then asks for a passkey instead of the
  6-digit code; the code and the recovery codes still work. New setting
  `WebUI.PasskeyAlone`, off by default: **Sign in with a passkey** signs in
  without the password, with a passkey that checks it is you. Passkeys need
  HTTPS or `localhost`, and work only on the host name where you added them.
  `tgoat webui reset` removes them too.
- TGoat waits while you play. When you start, cancel or speed up something
  in a queue of the game yourself, the features that build or send fleets
  wait until you have done nothing in the game for 10 minutes, then start
  again one by one. The Defender keeps watching. The game's channel tells
  TGoat, without any request. Setting `General.YieldWhenYouPlay`, on by
  default; the Map, the Instances page, `/getmain` and `/getmainstats` say
  why features wait (`you_play_in_game`).
- The Brain sees a build that ends early (sped up in your browser) and picks
  the next one after a usual reaction, instead of waiting for the planned
  end.
- Defender fleet-save options. `Defender.Autofleet.Departure` LastMoment
  sends the message to the attacker when the attack is seen and the fleet
  only at the impact minus the safety margin, minus 0 to 30 seconds.
  `Defender.Autofleet.Speed` Cheapest flies at the slowest speed that still
  keeps the fleet away (about 70 % less deuterium at 10 %).
  `Defender.Autofleet.SwitchFirst` moves the fleet to the moon or planet at
  the same position first, when no hostile fleet targets it.
  `Defender.Autofleet.Target` and `TargetMission` set a destination tried
  first. All off by default.
- Sign-in to the web interface. As soon as another computer can reach TGoat
  (an address other than `localhost`, Docker, a reverse proxy, a name in
  `WebUI.AllowedHosts`), the interface and the game proxy ask for a password.
  Once a password is set, it is always asked. Create it with
  `tgoat webui password` on the server, or on the sign-in page with the
  one-time setup code TGoat writes in its console and log file at start;
  there is never a default password. Optional authenticator app (6-digit
  codes, QR code drawn by TGoat) with 10 single-use recovery codes, sessions
  of 30 days that survive a restart, **Sign out** and **Sign out
  everywhere** (they also close live updates), and growing delays after 5
  wrong tries. The OGame page opens the game of one account only. New settings `WebUI.SignIn` (Auto, Always, Never) and
  `WebUI.TrustedProxies`; `tgoat webui reset` removes the password, the app
  and every session.
- A Docker image, `ghcr.io/ronnie32/tgoat` (linux/amd64 and linux/arm64),
  built from the signed release archives once their signature and checksums
  check out, and a `docker-compose.yml` to copy: ports open to this computer
  only, `config/`, `data/` and `log/` next to the file, and an optional Caddy
  service for HTTPS on your own domain. In the image, the web interface
  listens on all addresses and asks for a password, and TGoat never updates
  itself: it tells you to run `docker compose pull && docker compose up -d`.
  Guide: Get started, Run TGoat in Docker.
- `tgoat health` checks that a running TGoat answers on its game proxy (the
  health check of the Docker image).
- Behind an HTTPS reverse proxy listed in `WebUI.TrustedProxies`, the OGame
  page now opens the game proxy over HTTPS too, chat and live updates
  included.

### Changed

- AutoFarm spies like a player. The first espionage of a target uses the
  galaxy view's spy button with the probe count set in your game options.
  If the report hides the research of a target that has ships or defences
  (solar satellites and crawlers count), or hides its fleet or defences, one
  second espionage goes from the fleet page with three times that count, or
  all the probes at home on the origin if it has fewer; it never builds
  probes for it. If it still hides them, or if no origin has more probes at
  home than your count, the target is left alone until its report expires
  (reason `research_hidden`, `probes_exhausted` or `no_extra_probes`). A
  target with no ships and no defences is attacked without its research.
- AutoFarm reads the espionage reports when the game announces the new
  message, no longer at the computed arrival of the probes. Without the
  game's channel, it waits as before.
- Expeditions and Discovery read their results in the messages only when a
  new message came since the last read: fewer requests.
- The recall of a saved fleet is drawn at random, so a phalanx cannot
  predict its return. The fleet lands back only after the hostile arrivals
  known on its planet or moon, plus the safety margin, and the moment moves
  if a new attack comes. When no moment is safe, you get a warning.
- `Defender.Autofleet.DelayedFleetSave.Active` is replaced by
  `Defender.Autofleet.Departure`: true becomes Delayed, by itself, when
  TGoat starts or imports a TBot file.
- Sign in from another computer: when `tgoat login --to` fails or you press
  Ctrl+C after it took the code, it tells the server. The web page then says
  at once that the sign-in stopped (or was cancelled), instead of showing it
  open until the code ends.
- `tgoat login --to` sends the session token again, twice at most within
  about 10 seconds, when the connection to the server drops while it is sent,
  so a short SSH tunnel cut no longer loses your sign-in.
- `X-Forwarded-Proto` and `X-Forwarded-Host` are read only from a reverse
  proxy listed in `WebUI.TrustedProxies`, also for the `tgoat login --to`
  command shown by the interface.
- While a planned fleet-save waits for a fleet slot and you were already
  told that none will be free in time, the Defender no longer reads the
  planet's ships at every check: one game page less per check.
- Manual mode: the log line and the guide now say that a fleet-save planned
  before you started playing still leaves at its time, as it did before.

### Removed

- `AutoFarm.NumProbes`. Set the number of probes in the game's options
  instead. A file that still has it loads, and the setting does nothing.

### Fixed

- On Windows, saving the settings or TGoat's data no longer fails now and
  then with "Access is denied" when an antivirus examines the file being
  replaced.
- Settings help tells the truth. `Defender.Autofleet.UseJumpGate` and
  `Defender.Autofleet.ExpeditionAsLastResort` now say "(not used yet)": they
  change nothing. `General.ExchangeRate` says that only the production
  settings of AutoMine use it. `Defender.DefendFromMissiles` says what it does:
  it builds anti-ballistic missiles against a missile strike; the alert comes
  either way. `AutoFarm.MaxDefensePoints` and `MaxFleetPoints` count resources,
  not points, and `AutoFarm.MinimumPlayerRank` ignores players ranked lower
  than it, not higher. The help of `Defender.UseCurrentCelestial`,
  `RandomActivity`, `Home`, `WeakAttackRatio`, the bedtime fleet-save,
  `AutoFarm.TargetsProbedBeforeAttack`, the bomber and reaper ratios and
  `General.CaptchaAPIKey` is exact too. Nothing plays differently.
- The guide's reason-code table lists every reason code, with what it means:
  boosters, hiding resources in a build, production settings, ships for
  expeditions and the others.
- When the server time cannot be read, the Defender no longer times anything
  on your computer's clock. An attack still in the event list is never taken
  for landed, an empty planet is read again at the next check instead of
  being dropped, a Delayed or LastMoment fleet-save leaves at once, and the
  fleet stays away at least an hour. If the game says the fleet comes back
  before the impact, the planet is read again then, before the impact, and the
  fleet leaves again. The recall is set at the next check that reads the
  server time. No hostile arrival in the list counts as past: the fleet is
  not sent to, or moved first onto, a planet or moon that one targets.
- An attack keeps its alert and its planned fleet-save when another row of
  the event list starts or stops sharing its event id. Before, it was taken
  for a new attack, and the log said that its fleet-save was cancelled.
- A grouped attack (ACS) and a fleet attack that carry the same number are two
  attacks: the second one is no longer skipped as "already handled".
- A colony abandoned and founded again at the same place, or a moon formed
  again, is defended under its new id. When the last game page and TGoat's
  data disagree about the celestial at the attacked coordinates, TGoat reads
  the list of celestials again before the fleet-save.
- The Empire view gives each attack its own detection time, also two attacks
  whose event id cannot be read.
- Hiding resources in a build no longer keeps deuterium for a fleet-save that
  already left. It keeps it only while a fleet-save can still leave.
- With `Defender.Autofleet.DelayedFleetSave.SafetySeconds` under 15, hiding
  resources is no longer refused while it waits for the last look at an empty
  planet: the build starts at its time and leaves the planet's deuterium, for
  a fleet that lands before that last look.
- The web interface's OGame page says why the game does not show. When your
  browser cannot reach the game proxy (it has its own port: forward it too in an
  SSH tunnel or a Docker mapping), or the game has not loaded after 30 seconds,
  it tells you instead of loading forever.
- The game's chat and live updates (new messages, finished builds) now work in
  the web interface's OGame page. They go through TGoat and the account's
  proxy, like the game pages.
- A fleet-save no longer goes to one of your planets or moons that a hostile
  fleet targets. If no destination is left, a warning names the ones skipped.
- The fleet-save's last resort, the move to the moon or planet at the same
  position, now leaves `DeutToLeave` behind like any fleet-save.
- The galaxy view in the web interface's OGame page no longer spins forever.
  TGoat now passes on the type the game gives each answer, instead of guessing
  it from the content.
- AutoDiscovery: a discovery counter TGoat cannot read on the galaxy page now
  gives a warning, instead of "the game allows no discovery right now". A
  counter written with a thousands separator (`1.200`) is read correctly.
- Updates: a release whose signed list or signature is far too large is now
  reported as a release that could not be verified, with the "do not install
  it by hand" warning. Before, TGoat only logged a failed check.
- Updates: in Install mode, a version that keeps failing on your computer (an
  antivirus that blocks the new program, for example) is paused after 3
  failures in a row, or after one refused replacement of the program. TGoat
  tries it again 24 hours later, says so in the log and the banner, and the
  Install button still works. Failed clicks on Install do not count. Before,
  it downloaded the version again at every check.
- Updates: if TGoat could not put its own program back after a failed update,
  the banner now keeps saying which file to rename, even after a check, a
  withdrawn release or a settings change.
- Updates: when the previous version's `.old` file is gone after two failed
  starts, TGoat no longer refuses to install a newer version.
- Updates: a download replaced on GitHub by a bad file and then put back is
  installed, instead of staying rejected.
- Updates: after **Cancel**, the banner always says that the version is
  installed only if you ask for it.
- Updates: the "Release notes" link is built from the checked version number,
  and is left out when the release's tag on GitHub carries anything else
  (`v0.2.0+something`). Before, such a tag was shown in the banner, on
  Telegram and on Discord.
- Add an account: a **Test the login** still running when the browser
  sign-in's token arrives or is cancelled no longer shows its old result and
  universes afterwards.
- The sign-in panel says when TGoat could not be reached to stop a sign-in it
  gave up on: its browser window or pairing code may stay open for up to 10
  minutes.

## [0.1.0-alpha.1] - 2026-11-17

The first alpha: a complete OGame bot in one program, with a web interface.
Expect bugs, and try it on a secondary account first.

### Added

- Sign in with your browser: TGoat opens a browser window on the Gameforge
  login, you sign in and pass any check yourself (captcha, `gf-pow-captcha`,
  two-factor), and TGoat keeps the session token and closes the window. Use
  the **Sign in with your browser** button in Settings (Account) or in Add an
  account, `tgoat login`, or the new browser choice of `tgoat setup`. The
  window goes through the account's proxy. In Add an account, the lobby and
  proxy are locked during the sign-in, and on a running instance Settings
  asks before it starts. Pasting the token by hand still works.
- `tgoat login --to <address> --code <code>`, and the **Sign in from another
  computer** button: sign in on your own computer for a TGoat that runs on a
  server (VPS). Its traffic leaves through the server, and the command checks
  the address and the browser before it takes the code. See
  [TGoat on another computer](https://ronnie32.github.io/tgoat/start.html#remote-login).
- Setting `LoginBrowser`: `Auto` (default) or the full path of the browser
  that opens for the sign-in.
- Setting `WebUI.AllowedHosts`: extra host names the web interface answers to.
  TGoat now answers only `localhost`, IP addresses and the names it knows, and
  refuses any other with a 403 (see
  [Reaching TGoat by a name](https://ronnie32.github.io/tgoat/start.html#reverse-proxy)).
- Updates from GitHub: TGoat checks the releases of ronnie32/tgoat a few
  minutes after it starts, then about every 6 hours, and tells you once about
  each new version, in the web interface, on Telegram and on Discord. The
  banner at the top of every page has an **Install** button, and a **Cancel**
  button while it installs. `Update.Mode` (in `tgoat.json`): Notify (default),
  Install (installs by itself at a quiet moment: no attack being handled, no
  fleet-save planned or flying, no ghost sleep planned, no fleet being sent,
  no sign-in in progress, no manual mode, no sleep you asked for; it gives up
  after 24 hours and tells you) or Never (never contacts GitHub);
  `Update.Channel`: Alpha or Stable. A version is installed only if its
  signature matches the TGoat release key, its archive matches the signed
  checksum and it is newer than yours. A release that could not be verified is
  reported without its name or a link, and update notices are plain text with
  no link preview. If a new version fails
  to start twice in a row, the previous one comes back by itself.
  `tgoat version` prints the fingerprint of the release key. See
  [Updates](https://ronnie32.github.io/tgoat/start.html#updates).
- Setup assistant: a few questions (six at most, each already filled in from
  your account with the reason), then a plan of settings grouped by theme,
  each with a reason built from your account's numbers. Open it from the Map
  banner on the first run (**Start** or **Not now**), from the **Setup
  assistant** button at the top of Settings, or from the command palette.
  Nothing is written until you click **Apply**. It never changes a value you
  set yourself unless you tick "Use the proposed value", leaves alone the
  settings an active profile decides, and writes one entry in the settings
  history that you can restore. It reads the Empire view and the inventory at
  most once when opened, and only when they are older than 10 minutes. When
  the account reaches a new stage, one line in the Logs says so, once per
  stage.
- Setup assistant: the Expeditions question is skipped without astrophysics
  or a ship that can fly, and the Notifications question when no Telegram,
  Discord bot or Discord webhook is set up. A choice you made yourself
  (expeditions off, your notification level) is the answer filled in. If the
  account moved on since you saw the plan, nothing is written: "The plan
  changed since you saw it (the account moved on): make the plan again."
- `Notifications.Level` (Attacks, Important, Everything; default Everything)
  limits what an instance sends on Telegram and Discord. Important keeps
  attacks, warnings, errors, sleep mode and proposals. The web interface still
  shows everything.
- `Expeditions.Escort` (Strongest, None; default Strongest): None sends large
  expeditions without a combat ship.
- `AutoFarm.BuildBreakers` (Off, Suggest, Automatic; default Suggest) and
  `AutoFarm.BreakerMaxPaybackDays` (default 3): when AutoFarm turns a target
  down for its defences or ships, TGoat proposes the cheapest combat fleet to
  build that beats it and the turned-down targets near it, with its cost, the
  loot per day from the targets' production (measured, or estimated from the
  mine levels in the report), fuel, average losses,
  payback and risk. Nothing above the payback limit or beyond the Brain's
  reserves. Automatic builds it alone, one order per pass, only when your
  AutoFarm settings would raid with it.
- AutoFarm: a target guarded only by solar satellites or crawlers is raided
  with enough of your cargo ships to win, instead of a draw.
- AutoFarm combat planner: when no escort up to 8 times the target's
  strength holds, it now tries up to 128 times, within your stock, and finds
  safe fleets it used to miss.
- AutoFarm: an attack that came back while TGoat was stopped now counts the
  real loot written in the game's "Return of a fleet" message, instead of the
  expected loot. The real figure goes into the attack results, the target's
  rest time and its measured production. TGoat reads the first page of the
  fleet messages at most once per pass, only when such an attack exists, and
  the second page once more if the first one does not go back far enough.
  Like opening the tab in the game, this marks those messages read; none is
  deleted. The message does not list the ships, so losses stay unknown for
  that attack.
- New: proposals. A feature set to Suggest (Brain.Boosters, the AutoMine production settings) sends each change it would make, with its reason, and makes it only once you accept. Accept from a notification's Accept button in the web interface or on Discord, from the command deck or the command palette (Ctrl K), or with `/accept [number]` on Telegram (`/proposals accept` on Discord). `/proposals` (Discord `/proposals list`) lists what is waiting. TGoat first checks that the reason still holds; if not, it refuses and says why. The same proposal is not sent twice in a day. A restart of TGoat drops pending proposals, and the features make them again.
- New: ships for expeditions (`Expeditions.BuildFleet`: Off, Suggest,
  Automatic; default Suggest). TGoat works out the ships your expeditions lack
  and sends each as a proposal with its cost, value per day, payback and risk,
  saying which figures are measured and which come from the find model.
  - A Discoverer gets one pathfinder for each expedition an origin sends (the
    account's expedition slots are shared between the origins).
  - Any class gets more of the main ship (`Expeditions.PrimaryShip`, large
    cargo by default), only with every expedition slot in use and once 7 days
    and 20 results of your own expeditions show finds cut by a full hold
    (measured, or by the find model fitted to those finds). Ships are added
    one per expedition while the last one still pays back within
    `Expeditions.BuildFleetMaxPaybackDays` (10 days). An order uses up its
    evidence: the next one waits for 20 results flown with the new hold, at
    most 7 days, and no longer once the ships of the order are lost or moved.
  - Accepting builds at most the number you accepted, fewer if fewer are
    needed by then.
  - Automatic places one order per check, paid from the origin's surplus,
    never from what the Brain keeps for builds ranked before cargo ships
    (`Brain.SpendingPriority`).
  - The mission log now notes each expedition's hold, return time and
    pathfinder, to match each find with its fleet.
- Changed: web notifications show their text without the raw formatting tags.
- Guide: a search box in the top bar of every page (`/` or Ctrl+K). It shows
  results as you type, grouped by page, with the matched words highlighted. It
  also accepts typos, any part of a setting name (`loot fuel` finds
  `AutoFarm.MinLootFuelRatio`) and French words (sonde, flotte, lune, FdV…). A
  result opens the exact table row or folded section. Works offline, also when
  the guide is opened from disk.
- "About TGoat" in the command palette (Ctrl K) of the web interface: the
  version and the author, Zeus (zeus8000 on Discord). The logo's tooltip says
  it too.
- A TGoat icon: the browser tab of the web interface and of the guide, the
  guide's header and the README. It follows the light or dark theme.
- One program for everything: it talks to the game itself, with no second
  process to start and no port to free.
- Several accounts at once, each one an instance with its own device, proxy and
  settings.
- A plausible device of its own for each account, and a human pace between
  game requests, so accounts do not look alike.
- The Defender: it watches for attacks day and night and fleet-saves or recalls
  fleets in time. Its requests go first in the queue.
- The Defender is never silently blind. It logs when it stops or resumes
  watching and why, and how it watches during sleep and manual mode. When it
  cannot read the event list, it warns at once, again every 15 minutes while
  this lasts, and when it sees again (forwarded to Telegram with the other
  warnings). Its retries slow down to its normal pace after 3 minutes, so a
  night-long outage does not flood the game with requests.
- `Defender.NightWatch` (OnAlert, Always, Never; default OnAlert): how the
  Defender watches during sleep. Every request to the game marks a planet
  active, so OnAlert sends nothing while no message comes. TGoat keeps the
  game's notification channel open, through your proxy, as a browser's game
  tab does; each new message (a spy report, your fleets' reports, a private
  message) brings a check 1 to 3 minutes later, and a reconnection of the
  channel at night one check too; a message of the evening keeps its checks
  after bedtime. An attack sent without a fresh espionage report is not seen.
  Every 20 to 40 minutes TGoat checks that the game still listens, without
  asking the game anything; if the game ignores or refuses that check, it
  opens a fresh connection every 20 to 40 minutes instead, before closing the
  old one. If the channel fails, stops answering, cannot be reached to be
  checked, reopens more than 4 times in an hour or your proxy refuses its
  port, a warning, then checks every 4 to 8 minutes until the wake-up.
  Always checks all night; Never starts no new check, but an action already
  planned (a fleet-save, a recheck, hiding resources, a missile defence held
  by a passing error) still happens.
- `Defender.NightWatchFollowUp` (default on): with OnAlert, when the check
  after a message sees no attack, one more check 8 to 15 minutes after the
  message, to catch an attacker who sends his fleet after reading his spy
  report; a later message, not in the same burst as the first, gets its own
  look. The delays follow the attacker: the play mode does not change them.
- The bedtime notice says how the Defender watches during sleep and what that
  costs, and what stays exposed: fleets not saved, failed fleet-saves,
  resources.
- Anti-ballistic missiles against a missile strike are ordered again at each
  check until the game accepts them, and never twice for the same strike; a
  silo already full of them, or below level 2, ends it. In manual mode the
  Defender only alerts.
- A new account starts with every feature off. You turn features on one at a
  time.
- AutoFarm that simulates a fight before attacking, guards its fuel, picks the
  probes from the espionage rule, rests targets until their loot grows back and
  spreads the work over your origins. It skips players who came back. Every
  target shows the reason it is attacked or not.
- Sleep mode, with a fleet-save at bedtime, and notifications on Telegram,
  Discord webhooks and the Discord bot.
- Control from Telegram: follow every instance, and read or change any
  setting.
- A Discord bot of your own: create it in the Discord developer portal, invite
  it to your own server, and command TGoat there like on Telegram. Every
  Telegram command exists, grouped by topic (`/fleet list`, `/sleep now`), with
  typed options and suggestions as you type. Telegram keeps its command names.
- Discord notifications as coloured messages with buttons: Attacks and Wake up
  under an attack alert, Wake up and Cancel ghost sleep under sleep notices,
  Bid minimum under auctions. Alerts, notifications and logs can each have
  their own channel, chosen with `/tgoat channel` in the channel itself. An
  attack alert mentions you, so Discord rings on your phone; nobody else is
  ever pinged.
- Only the owner of the Discord application, and the users you allow, can
  command the bot, and only in its own server. Answers are public in the TGoat
  channels and private elsewhere; an answer that takes more than 15 minutes
  comes by direct message. Costly commands (build, bid, collect all, message
  the attackers, phalanx, spy-crash, disable an instance) ask you to confirm
  first, and run on the instance and celestial they showed.
- The Discord bot forwards warnings and errors to its logs channel
  (`/logs set-level` changes the level), can send a regular sign of life, and
  keeps its notifications while Discord is unreachable, retrying them in order
  for up to 6 hours, without delaying Telegram. When too many wait, the oldest
  routine notification goes first: attack alerts are kept. `/tgoat help` lists
  every command with its options and its Telegram name.
- If you reset the bot token in the Discord developer portal while TGoat runs,
  the bot stops at once and the web interface says why; paste the new token
  to start it again. A Discord connection lost for more than 5 minutes is
  reported too, and so is its return.
- Set up the Discord bot from `tgoat setup` or from the Instances page of the
  web interface: paste the bot token (kept in secrets.json, never shown again),
  get the invite link, see whether the bot is connected, its server, owners and
  channels, and turn off the Discord webhook of any instance that would send
  every message twice. Once the bot has its server, it keeps it, and ignores
  any other server it is invited to.
- A web interface on `http://localhost:9090`: a live map of your empire, a 3D
  command deck, the AutoFarm page, settings forms with help for every setting,
  live logs you can filter, account management, and the game itself in your
  browser.
- A first-run guide in the web interface and in the terminal (`tgoat setup`)
  that adds your account, tests the login and picks the universe.
- Login with a session token, for accounts with two-factor authentication.
- A settings history you can restore, profiles you can load for a few hours,
  and an import of the settings of TBot 3.6 on the first start.
- A command palette (`Ctrl+K`), a day and a night theme, and an attack banner
  on every page.
- Corrected game formulas (production, costs, durations, cargo, fuel),
  compared with server data and real flights.
- `tgoat version` and `tgoat --version` print the build. The log and the web
  interface show that this is an alpha build.
- Opt-in settings, all off by default:
  - `Expeditions.NightRound`: just before bedtime, every free expedition
    slot leaves and comes back shortly after the wake-up. Needs sleep mode.
  - `SleepMode.Breaks.Active`: 1 to 2 breaks a day, 30 to 90 minutes each,
    more than 2 hours away from waking up and from bedtime, with no fleet
    sent and no queue restarted. Afterwards the features start again one by
    one, and a reconnection does not end a break. The Defender keeps
    watching; with `SleepMode.Breaks.DefenderAtSleepPace` it watches as at
    night (`Defender.NightWatch`).
  - `Brain.AutoMine.SpendStockUnderAttack`: under attack, what the fleet-save
    cannot carry goes into the best affordable build.
  - `AutoHarvest.HarvestOtherDF`: harvest the fields your attacks leave and
    the other positions of your systems, from 100,000.
  - `Brain.LifeformAutoMine.BuildNonEconomic`: also build lifeform buildings
    that produce nothing.
- Expedition results: what each expedition found and lost, and a daily
  total, in the log. A notification when an expedition fleet is lost.
- Colonize notifications (Discord by default): new colony, colony abandoned,
  try limit reached. Every colony of a target zone is recorded in
  `data/<id>/colonize/draws.json`.
- The offer of the day reports and notifies the item and its rarity.
- New report reasons: `slots_reserved` when free fleet slots are kept for
  higher-priority features, and one per new case (see the guide's
  [reason codes](https://ronnie32.github.io/tgoat/interface.html#ui-reasons)).
- A play mode switch, `Mode`: Human (default, the same rhythm as before),
  RAGE or Custom. RAGE drops every delay kept only for discretion: reactions
  and pauses of 1 to 3 seconds, no waves, checks ten times as often, pages
  0.3 to 1.5 seconds apart, no breaks. Custom applies the new `Pace.*`
  settings one by one. The switch is on the Map, on each Instances card and at
  the top of Settings, and `/mode` does the same in Telegram and Discord.
- Directives, off by default (`Directives.Active`): TGoat collects the
  rewards of the OGame 13 Directives once their missions are done. It looks at
  the Directives menu every 2 to 6 hours and opens the chapters only when the
  menu shows a reward, or about once a day. A mission that is not finished is
  never collected.
- Two Directives missions TGoat can do itself, each with its own setting, off
  by default: setting the Metal Mine output to 90% and back to 100% (only when
  it is at 100%), and opening the Small Cargo's technology tree.
- `Brain.SpendingPriority`: the order in which features may spend a
  celestial's stock is a setting. The defaults keep today's order.
- Priorities as lists: slot priority and spending priority are lists you
  reorder by dragging or with arrows, with ties and a sentence that says what
  the order does, instead of number fields. The file still holds one number
  per feature.
- Turn a feature on or off whatever its setting, until you undo it or for a
  duration (1 h, 4 h, 24 h or any duration), from the Map and Deck panels
  ("Turn on now", "Turn off now", "Follow the setting"), the palette ("off
  autofarm 4h"), Telegram (`/stopautofarm 4h`, `/startbrain`, `/stopbrain`,
  `/followsetting <feature>`) and Discord (`/feature start|stop` with a
  `duration` option, `/feature follow`). The choice survives reloads, sleep,
  breaks, reconnections and restarts. It is kept in `data/<instance>/overrides.json`,
  never in the settings, and ends when you follow the setting, when the
  feature's `Active` setting is written, or when the duration ends.
- The Map and the Deck show both the state you chose and the setting
  ("Running, turned on by you (setting: off)", "Off until 18:00 (setting:
  on)"), and warn when the Defender is turned off.

- Directives: the collect line names each mission and its chapter, for
  example "Chapter II: Open the tech tree for Small Cargos (300 deuterium)",
  the first four of a pass and how many more. `Directives.Notify` chooses when
  you get a notice: every reward, only when Dark Matter comes in (default), or
  never. The notice names the missions.
- Lifeform research slots: when a slot opens, TGoat chooses its technology,
  then researches it. `Brain.LifeformAutoResearch.SlotChoice` says how:
  `Guaranteed` (default, the technology the game guarantees), `Random` (a draw
  among every lifeform you discovered) or `Never` (you choose). Each choice is
  logged and notified. A slot whose limit is 0 is left to you. The report says
  which slot waits for you, and which population opens the next one ("slot 2
  opens at 300,000 T1 population (now 278,173)").
- Lifeform research: a level that brings no production bonus starts only if
  it costs at most `Brain.LifeformAutoResearch.MaxHoursWithoutYield` hours of
  the planet's production (24 by default; 0: never). Otherwise it waits, and
  the report says what it costs and which setting to raise.
- Discovery can choose the lifeform of your planets
  (`AutoDiscovery.SettleLifeforms`, off by default). When no planet has
  Humans, they go first to the home planet: only Humans can discover the other
  lifeforms. Every other planet without a lifeform then takes the
  highest-ranked lifeform available now (`Preference`: Humans, Rock’tal,
  Mechas, Kaelesh) and keeps it. A lifeform already settled is never changed,
  and planets in `Exclude` are kept for later. Each settlement is logged and
  notified. With the setting off, the Discovery report and a daily
  notification list the planets without a lifeform.
- Expedition and exploration results are read from the game's messages, for
  the last 24 hours and the last 7 days. The Expedition report shows sent and
  answered, resources, dark matter, ships found and fleets lost; the Discovery
  report shows explorations, artifacts, ships lost and lifeforms found, such
  as "last 24 h: 10 explorations, 21 artifacts, 2 ships lost, no species".
  Reading only opens the message tab; nothing is deleted.
- Easier log lines: time, instance › feature, then the message; ⚠ marks a
  warning, ✖ an error, and each feature's name has its own colour.
  `Logging.Style` (Readable, Levels, TBot) and `Logging.Colours` change the
  console, `TGoat.log` and the Logs page at once; pick a feature's colour with
  the Logs page's Colours button (`Logging.FeatureColours`). `TGoat.csv` keeps
  its columns, and `NO_COLOR` turns the console colours off.
- Map and 3D views: one construction ring per body, with what builds and the
  time left when you zoom in. A planet's panel shows its building levels (and
  lifeform buildings), its idle queues and why TGoat chose its next build.
  Works (`W`) hides the marks.
- The Map's planet panel shows the lifeform research in progress with its
  countdown, also on the timeline, and every panel lists the defences. Moons
  show their stock, buildings, ships, defences and works once TGoat has read
  the empire, instead of "not read yet".
- Notifications say which feature sends them: on Telegram its name in bold
  after the instance, on Discord (bot and webhook) in the title, such as
  "Directives · Action completed". Messages from TGoat itself look as before.
- A warning when the game session is lost too often: after three automatic
  logins in 30 minutes, TGoat stops logging in, sends one notification with
  the time it will try again, and does not repeat it for 30 minutes.
- Project Orion (rolled out on 30 November 2026): TGoat keeps reading the game
  correctly and never plays Orion. Anomalies are never targets. An attack on
  your fleet at an anomaly is told apart from an attack on a planet. A building
  TGoat does not know in a production queue, such as the Interstellar Anomaly
  Scanner, no longer hides the queue. One notification tells you when an Orion
  reward waits to be claimed in the game within the hour
  (`Notifications.OrionReward`, on by default). TGoat sees it only when it
  loads a full page, so not at night with `Defender.NightWatch` on `OnAlert`.
  The mark it reads comes from the game's script and has not yet been seen on
  a real Orion page.
- `Defender.HideResourcesInBuild` (off by default): when an attack will
  plunder a celestial, the build that keeps the most out of the plunder
  starts 1 to 4 minutes before the impact and is cancelled 20 to 90 seconds
  after the last wave; the game gives its cost back. Only what the
  fleet-save leaves counts, nothing is started below `MinLootAvoided`
  (50,000 in deuterium value), and a build TGoat did not start is never
  cancelled. Not during sleep unless `WhileAsleep` is on.
- `Brain.Boosters` (Suggest by default, with the Brain on): the boosters
  already in your inventory are proposed where and when they gain the most,
  and activated once you accept; Automatic activates them alone. An energy
  booster goes only to a planet that lacks energy. TGoat never buys one.
- `Brain.AutoMine.ProductionFactors` (each Suggest by default): while energy
  is short, AutoMine may lower the deuterium synthesizer or the crawlers; it
  runs the fusion reactor only as far as the planet needs; on a Collector
  account it raises crawlers up to 150% while energy is left over. Never the
  metal or crystal mine, and back to 100% once the reason is gone.
- Guide: a section on the home page, "How TGoat keeps its footprint small",
  says what TGoat does to send fewer requests and look like one ordinary
  player, and what it cannot hide.

### Changed

- The messages of a refused session token, of `gf-pow-captcha` and of
  two-factor now point at **Sign in with your browser** and `tgoat login`. An
  instance whose login failed gets a link to it on its card.

- AutoMine and the lifeform buildings read fewer game pages: at startup the
  first visit of each planet reuses what the planning has just read, and
  every later pass reads one page less. The login no longer reads the
  researches twice.
- Telegram: `/ping` answers with the version ("Pong, TGoat 0.1.0-alpha.1"), and
  so does the first line of the regular sign of life. On Discord: `/tgoat ping`.
- Telegram: `/wakeup` on an instance that is already awake answers "The bot is
  already awake.", and `/cancelghostsleep` answers plainly when no ghost sleep
  is planned, or when it has already started. On Discord: `/sleep wakeup` and
  `/sleep cancel`, also behind the buttons of the sleep notices.
- Telegram: the `/help` texts are clearer (`/setmain`, `/loglevel`,
  `/setloglevel`, `/celestial`, `/ghostsleepall`, `/cancelghostsleep`,
  `/collectall`, `/testaccount`), and every `/stop…` command has its own line.
- Telegram: a command with missing, extra or wrong words now explains the
  problem for the form you typed, and shows the usage of that form only
  (`/instance`, `/profile load`, `/settings get`, `/settings set`…).
- Telegram: `TelegramAutoPing.EveryHours` at 0 now means every hour, as on
  Discord; only `TelegramAutoPing.Active` turns the sign of life off.
- Telegram and Discord: a password or token that an error message repeats is
  masked in command replies, as it already was in the logs.
- Settings: many defaults changed after the November reviews (payback 60
  days, storage caps 20, intervals, jump gate threshold, expeditions per
  origin). The full list is in the guide's
  [changed defaults](https://ronnie32.github.io/tgoat/from-tbot.html#defaults).
- Importing TBot settings: a value equal to TBot's old default now takes
  TGoat's new default, with one report line each. This includes the
  expedition minimum and reserve (1000 and 10000 ships), the lifeform research
  caps (`MaxTechs12` to `MaxTechs36`) and
  `AutoDiscovery.ArtifactStorage.ResumeBelow`. A tier 3 cap of 0 in the TBot
  template ("never research") becomes 10 like the others.
  `AutoHarvest.MinimumResourcesOwnDF` is kept and flagged instead.
- Brain, buildings: mines are built by payback over 60 days, energy
  included. Energy comes from the cheapest source (solar plant, satellites,
  fusion). Facilities are built by use. Crawlers come in batches with their
  energy.
- Brain, research: chosen by value for the account, with a research profile
  (`Brain.AutoResearch.Profile`, Miner by default).
- Brain, lifeforms: buildings chosen by payback; open research slots start at
  level 1; ship technologies capped by `MaxShipResearchLevel` (0 by default).
- Brain, queues restart after a human delay (about 3 minutes, at most 5% of
  a long build), not 5 to 15 seconds after each build.
- Brain, a build waiting for resources keeps them (`Brain.ReserveHours`):
  repatriation and other spending leave them alone.
- Supply flights leave only when they save time (`MinHoursSaved`), with large
  cargo ships, and an origin gives only its surplus.
- Repatriation ships a celestial's surplus once it reaches `MinimumResources`,
  and once more before bedtime.
- Defences follow a budget of 24 hours of production, split by a mix; the
  quantities are maxima.
- Jump gate: threshold in points (1,000); it waits for the recharge and
  never jumps to or from a moon under attack.
- Offer of the day: bought once after it renews, at a random time within
  12 hours, under `MaxPriceHours` of production, paid from one celestial's
  surplus. It is not bought during a break, nor right after a sleep or a break
  ends.
- No fleet lands on one of your planets or moons, going out or coming back,
  when an attack will hit it after the landing or less than 5 minutes before.
  An ordinary send leaves on its origin the fuel the ships that will be home
  need for a slow fleet-save (10% speed, to a planet 5 systems away).
- Fleet slots: a higher-priority feature keeps only what its next pass will
  send. A round trip of 15 minutes or less goes ahead of the ranks.
- Expeditions: no limit per origin by default; they leave in waves at a
  human pace, from the celestial that lines up the largest expedition, with
  cargo for 75% of the largest find (`Expeditions.CargoShare`).
- Harvest reads a system when something happens there (an impact, an
  expedition's end) and scans your systems every 2 to 4 hours. It starts
  from the field's own celestial.
- Discovery spends at most 5% of the account's production a day and sends
  in waves.
- Colonize: a fields threshold per zone, at most 10 failed tries per zone,
  zones served in their order, and a decision 3 to 20 minutes after a colony
  is founded. It follows its events instead of one 15 to 20 hour interval. A
  planet inside two overlapping zones counts only for the first zone listed.
- `/startX`, `/stopX`, `/feature start` and `/feature stop` no longer last only
  until the next wake-up or reload: the choice sticks (see Added). Starting a
  feature during sleep or manual mode is accepted and applies when it ends; a
  planned ghost sleep and breaks still hold it.
- The web API answers `POST .../features/{feature}/start|stop` with the feature
  state (200) and takes an optional `{"duration": "4h"}`; `.../follow` is new.
- Brain, lifeforms: research is chosen by payback for production technologies
  (and the Collector enhancement on a Collector account), its bonus counted on
  every planet. The other technologies follow, cheapest first, up to
  `MaxResearchLevel` (10 by default).
- Brain, lifeforms: research no longer stops while research slots are still
  closed; it checks again every 11 to 13 hours.
- Brain, lifeforms: a building's energy is priced like a mine's (satellites at
  their risk factor).
- Brain, while a build runs, its queue keeps the resources of the build that
  follows, so repatriation no longer ships them to the hub and back.
- Brain, repatriation no longer waits 6 to 12 hours after each login: it comes
  back once the Brain queues have republished their builds (15 minutes at
  most).
- Brain, builds leave the fuel the celestial's ships need for a fleet-save.
- While the event list cannot be read, no cargo is delivered to your own
  planets and moons.
- Repatriation flights count in `Brain.Transports.MaxSlots`, shared with supply
  flights.
- `/fleet spycrash` works right before an impact.
- After a sleep, or any wake-up, the features start again one by one, each
  after its own human delay (about 3 minutes, sometimes up to an hour),
  instead of all within two minutes. The Defender checks at once.
- Fewer game requests: the server time now comes from the last game page
  read. Before, each fleet send read the overview page once and each Defender
  check twice, only for the clock. The overview is read again only after 10
  minutes without any page. The server time no longer depends on your
  computer's clock being right.
- Brain, lifeforms: with lifeform research on for a planet, its research
  building (the Research Centre for Humans) is built to level 1 right after
  food, with the requirements it lacks.
- Fewer game requests when AutoMine and LifeformAutoMine start: they read the
  whole empire from the Empire view and the production queue page (two or
  three requests) instead of about five pages per planet. On a simulated game
  of 8 planets and 4 moons, starting both goes from 104 reads to 47. Planets
  with a lifeform still have their lifeform buildings page and resource bar
  read once. If the Empire view cannot be read, each planet is read as before.
  Decisions are unchanged.
- AutoResearch no longer reopens the research page when the empire was read
  less than 10 minutes ago and no research can have finished since.
- AutoFarm sends its probes like a player, with the galaxy view's spy button:
  one request per target instead of about ten (a 30-probe pass on a simulated
  game: 309 requests → 40). Fuel, sleep, breaks, the attack guard and slots are
  still checked first. If the game refuses, that target goes through the fleet
  page, and the log says so once.
- AutoFarm deletes the espionage reports it has read in one request per inbox
  page, instead of two requests per report: 19 requests instead of 47 for a
  pass that clears 15 reports. If the grouped deletion fails, the reports of
  that page are deleted one by one, and the log says so once per pass.
- Defender: when a game page TGoat loads shows the attack alert, the Defender
  checks the event list 5 to 15 seconds later instead of waiting for its next
  check. One extra check per alert, no extra request otherwise.
- Defender: the attacked planet is read only when an option uses its ships
  (weak attack, little at stake, spying back, fleet-save), at most once per
  check. Each read marks the planet active. At night, a check that finds no
  attack is a single request.
- Directives: the number of rewards waiting is read from the pages TGoat
  already loads, instead of a request for the menu. When that number goes up,
  the next collect comes forward, never less than 30 to 60 minutes after the
  previous one.
- Flight times and fuel are exact on universes that skip empty or inactive
  systems. TGoat reads those two server settings, asks the game once per pair
  of systems without sending anything, and keeps the answer for 12 hours.
  Every send refreshes it, and a universe that skips nothing is never asked.
  Fleet-saves no longer come home before their minimum time, night-round
  expeditions no longer land during sleep, and a send is no longer refused for
  fuel it does not burn.

### Fixed

- Defender: when the attacked planet had no ship to save, the attack was
  closed for an hour, so a fleet that landed there before the impact stayed
  exposed. The ships are now read once more shortly before the impact
  (`Defender.Autofleet.DelayedFleetSave.SafetySeconds` before it, or 2
  minutes), and a fleet that landed meanwhile is saved.
- Defender: a fleet-save no longer comes back too early, or gives up,
  because your computer's clock is wrong: TGoat times it with the game's
  arrival time and the server's clock. If the arrival time cannot be read,
  the fleet leaves at once, you get a notice, and it leaves again each time
  it comes back while the attack is listed.
- AutoFarm: probes whose fleet left the fleet list more than 10 minutes
  before a pass (restart, long pass, sleep) no longer lose their espionage
  report; the inbox is read before a target is probed again.
- Expeditions size the cargo for the doubled maximum find only when a
  pathfinder is in the fleet. Without one, they send about half as many
  cargo ships and keep the rest free. Only the Discoverer class can build
  pathfinders (checked in game 13.1).

- AutoFarm now reads every page of espionage reports. It asked the game for
  the next page with a field the game ignores, so it only ever read the
  first page. If the game ignores the page number again, the reading stops
  and a warning says so. After deleting reports, it reads the same page again,
  since the next reports move up onto it.
- The night round of expeditions no longer asks for more holding hours than
  the game offers: the most it can ask is your Astrophysics level (checked in
  the game: Astrophysics 13 offers 1 to 13 hours).
- The offer of the day now reads the container's rarity again; the game
  changed the class that carries it.
- Mine energy use is rounded down, as in the game. It was one too high per
  mine.
- The position bonus applies to the basic income, as in the game.
- AutoMine no longer stops for good when the next build is larger than the
  storage, and no longer builds every facility to its maximum when no mine
  pays back.
- Crawlers no longer drop a planet's production by being ordered without
  the energy to run them.
- Research no longer waits for the research lab, and works without AutoMine.
- A lifeform planet waiting for energy, population or research is retried,
  not stopped.
- Repatriation leaves each planet the fuel for a fleet-save, no longer
  empties the supply origin, and a return during sleep skips only that
  celestial.
- AutoCargo counts its cargo ships in flight and their price. Orders with
  missing requirements are no longer sent.
- Expeditions: the old default allowed one expedition in flight per origin
  (`MaxExpeditionsPerOrigin` 1). It is now 0, no limit.
- Expeditions no longer leave with an escort only, no longer carry 20,000
  deuterium, and no longer hold slots when nothing can leave.
- Harvest no longer burns more than 10% of a field's value in fuel.
- Discovery no longer reads up to 499 system views a pass when the game
  refuses the origin, and no longer reports `no_ships`.
- Colonize no longer loops between founding and abandoning. With abandon on
  but no stored password, new colonies are kept and developed.
- A feature without a slot rank can no longer use more slots than its
  maximum.
- Colonize no longer retries a failed abandon every 3 minutes forever. It
  waits 5 to 15 minutes, then twice as long, and after the third failure keeps
  the colony untouched and warns you. If the game refuses the stored account
  password, or does not apply the abandon, TGoat stops sending it until it
  connects again.
- A colonize zone that reached its try limit no longer receives colony ships.
- A colony ship refused or taken at one position now tries the next free
  position of the same zone in the same pass.
- Colonize with no free fleet slot waits for the first fleet to return plus a
  human delay, not a fixed 20 to 50 seconds.
- Colonize no longer keeps every fleet slot from Discovery and Harvest during
  its passes, and keeps none while it is stopped.
- Expeditions leave with exactly the ships composed: ships taken by another
  feature just before the send no longer make an escort-only expedition, and
  the result compares the return with the ships that really left.
- An expedition that came back early without being seen is no longer reported
  as lost for certain: the message says "lost, or returned early". An early
  return seen on its way home counts as a return, not a recall.
- Expeditions no longer hold slots that the ships coming home cannot fill.
- A moon without deuterium for an expedition gives an information line
  instead of a warning on every pass.
- With the automatic expedition origin, only celestials where ships may have
  arrived are read again, instead of every celestial every 3 hours.
- Harvest keeps one pathfinder per expedition slot on each expedition origin,
  not one per origin.
- Harvest waits up to 3 hours after an impact for recyclers returning from a
  fleet-save, and reads a field again when they are back.
- Harvest and Discovery read fewer ship lists and origin stocks per pass.
- Discovery no longer freezes when the game refuses a system view for a reason
  other than the missing research: the system is skipped. A refused
  whole-system send falls back to one send per position, and a missing
  research stops the pass at the first origin.
- The offer of the day is no longer bought at the same moment every day, nor
  right when a sleep or a break ends.
- Jump gate: the recharge of the destination gate is recorded as well, and the
  attack list is read only when a jump is possible.
- A new colony builds its mines first. It used to start with the robotics
  factory for its shipyard (crawlers, AutoDefence, AutoCargo), paid in
  deuterium it did not produce, and waited forever. A planet without supply
  flights never picks a facility it cannot pay.
- AutoMine no longer orders solar satellites or crawlers while the shipyard or
  the nanite factory is being upgraded; the game refused them and AutoMine
  retried for days.
- Solar satellites bought while a mine is being built no longer count that
  mine's energy twice.
- The shipyard is raised only for the defences the AutoDefence budget buys.
- No research lab is built while AutoResearch is off.
- On a new account, the opening research order asks for research lab 1 after
  the first mines (metal mine 5, crystal mine 3, when AutoMine's start order
  runs), then labs 2 and 3 as its researches need them. TBot built the first
  lab only once it cost less than the next mine.
- Energy built before the next mine no longer says "energy deficit".
- A feature that was stopped kept holding its fleet slots against lower-ranked
  features. A feature turned off now holds none, and one turned on counts even
  when its setting is off.
- A moon build no longer keeps the `DeutToLeaveOnMoons` floor twice.
- The shipyard is no longer raised for crawlers that would not pay back within
  the longest payback accepted (about 12,000 deuterium-equivalent wasted per
  new colony at speed 1).
- A send that does not require every ship now sends the ships available on the
  dispatch page, instead of failing when the count asked for is not there.
- If the game still lists a planet after TGoat sent the abandon, Colonize
  treats it like a refused password and sends no more posts until TGoat
  connects again. Before its first pass, Colonize also holds at most the free
  planet slots.
- The combat planner's last check before an attack no longer refuses, about
  4 times in 10, a light-fighter escort it has just confirmed. It now
  simulates 773 battles of the fleet that leaves and accepts at most 3 with a
  ship lost, which still keeps the chance of losing a ship under
  `AutoFarm.CombatPlanner.MaxFailureProbabilityPercent` (1%). A refused plan
  says why.
- "Run now" no longer triggers a second, scheduled run right after the one
  you asked for; the feature's last run shows the requested run.
- A feature's next run is known as soon as its run ends: the page no longer
  flashes "no next run", and switching to Rage or Custom no longer misses a
  feature that had just finished a run.
- Changing the Discord bot token or server no longer loses a notification
  sent while the bot restarts: the new bot takes over the notifications
  before the old one disconnects.
- The settings history no longer keeps copies of `secrets.json`. TGoat
  copied it there at startup and during `tgoat setup`, with the e-mail, the
  proxy login and the Discord webhook in clear. The next start deletes those
  copies, also in the folders that `tgoat import --again` set aside, and
  logs how many it removed.

### Removed

- `Brain.AutoMine.BuildDepositIfFull`,
  `Brain.LifeformAutoMine.StartFromCrystalMineLvl`,
  `Brain.AutoResearch.PrioritizeEnergyTechnology`,
  `Brain.AutoResearch.ForceResearchWhateverTheLabLevel`,
  `Expeditions.FuelToCarry`, `Expeditions.IgnoreSleep`,
  `Expeditions.MinWaitNextRound`, `Expeditions.MaxWaitNextRound`,
  `AutoColonize.Abandon.MinFields` (now per zone) and
  `AutoColonize.IntensiveResearch` (now `AutoColonize.ParallelTries`). A file
  that still has them loads; they do nothing.

[0.1.0-alpha.1]: docs/index.html

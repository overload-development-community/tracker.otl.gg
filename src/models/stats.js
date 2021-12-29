const Db = require("../database/completed"),
    Game = require("./game"),
    Player = require("./player"),
    Weapon = require("./weapon"),
    Websocket = require("../websocket");

//   ###    #             #
//  #   #   #             #
//  #      ####    ###   ####    ###
//   ###    #         #   #     #
//      #   #      ####   #      ###
//  #   #   #  #  #   #   #  #      #
//   ###     ##    ####    ##   ####
/**
 * A class that represents statistics.
 */
class Stats {

    // teamChange ASCII here
    /**
     * Processes the teamChange stat.
     * @param {string} ip The IP address of the server to update.
     * @param {object} data The teamChange data.
     * @returns {Promise} A promise that resolves when the stat has been processed.
     */
    static async teamChange(ip, data) {
        const { playerName, previousTeam, currentTeam } = data,
            game = await Game.getGame(ip);

        data.description = `${playerName} changed from ${previousTeam} to ${currentTeam} team`;
        game.events.push(data);
        game.teamChanges.push(data);

        const player = game.getPlayer(playerName);
        player.team = currentTeam;
    }

    // #     ##                   #
    // #      #                   #
    // ###    #    #  #  ###    ###   ##   ###
    // #  #   #    #  #  #  #  #  #  # ##  #  #
    // #  #   #    #  #  #  #  #  #  ##    #
    // ###   ###    ###  #  #   ###   ##   #
    /**
     * Processes the blunder stat.
     * @param {string} ip The IP address of the server to update.
     * @param {object} data The blunder data.
     * @returns {Promise} A promise that resolves when the stat has been processed.
     */
    static async blunder(ip, data) {
        const {scorer, scorerTeam} = data,
            game = await Game.getGame(ip);

        if (!game.settings) {
            game.settings = {matchMode: "ANARCHY"};
        }

        if (!game.settings.matchMode) {
            game.settings.matchMode = "ANARCHY";
        }

        if (game.settings.matchMode !== "MONSTERBALL") {
            game.settings.matchMode = "MONSTERBALL";
            game.teamScore = {"BLUE": 0, "ORANGE": 0};
        }

        const scorerPlayer = game.getPlayer(scorer);

        scorerPlayer.team = scorerTeam;

        scorerPlayer.blunders++;

        const otherTeam = scorerTeam === "BLUE" ? "ORANGE" : "BLUE";

        if (game.teamScore[otherTeam]) {
            game.teamScore[otherTeam]++;
        } else {
            game.teamScore[otherTeam] = 1;
        }

        game.goals.push(data);
        data.description = `BLUNDER! ${scorer} own goals for ${otherTeam}!`;
        game.events.push(data);
    }

    //                                      #
    //                                      #
    //  ##    ##   ###   ###    ##    ##   ###
    // #     #  #  #  #  #  #  # ##  #      #
    // #     #  #  #  #  #  #  ##    #      #
    //  ##    ##   #  #  #  #   ##    ##     ##
    /**
     * Processes the connect stat.
     * @param {string} ip The IP address of the server to update.
     * @param {object} data The connect data.
     * @returns {Promise} A promise that resolves when the stat has been processed.
     */
    static async connect(ip, data) {
        const game = await Game.getGame(ip),
            player = game.getPlayer(data.player);

        player.disconnected = false;
        player.connected = true;
        data.description = `${data.player} connected.`;
        game.events.push(data);
    }

    //        #      #
    //        #     # #
    //  ##   ###    #
    // #      #    ###
    // #      #     #
    //  ##     ##   #
    /**
     * Process the CTF stat.
     * @param {string} ip The IP address of the server to update.
     * @param {object} data The CTF data.
     * @returns {Promise} A promise that resolves when the stat has been processed.
     */
    static async ctf(ip, data) {
        const {event, scorer, scorerTeam} = data,
            game = await Game.getGame(ip);

        if (!game.settings) {
            game.settings = {matchMode: "ANARCHY"};
        }

        if (!game.settings.matchMode) {
            game.settings.matchMode = "ANARCHY";
        }

        if (game.settings.matchMode !== "CTF") {
            game.settings.matchMode = "CTF";
            game.teamScore = {"BLUE": 0, "ORANGE": 0};
        }

        if (event === "Return" && !scorer) {
            game.flagStats.push(data);
            data.description = `The ${scorerTeam} flag has been automatically returned.`;
            game.events.push(data);
            return;
        }

        const scorerPlayer = game.getPlayer(scorer);

        scorerPlayer.team = scorerTeam;

        game.flagStats.push(data);

        switch (event) {
            case "Return":
                scorerPlayer.returns++;

                data.description = `${scorer} returned the ${scorerTeam} flag.`;

                break;
            case "Pickup": {
                const otherTeam = scorerTeam === "BLUE" ? "ORANGE" : "BLUE";

                scorerPlayer.pickups++;

                data.description = `${scorer} picked up the ${otherTeam} flag.`;

                break;
            } case "Capture":
                scorerPlayer.captures++;

                if (game.teamScore[scorerTeam]) {
                    game.teamScore[scorerTeam]++;
                } else {
                    game.teamScore[scorerTeam] = 1;
                }

                data.description = `${scorer} scores for ${scorerTeam}!`;

                break;
            case "CarrierKill": {
                const otherTeam = scorerTeam === "BLUE" ? "ORANGE" : "BLUE";

                scorerPlayer.carrierKills++;

                data.description = `${scorer} killed the ${otherTeam} flag carrier!`;

                break;
            }
        }

        game.events.push(data);
    }

    //    #   #                                                #
    //    #                                                    #
    //  ###  ##     ###    ##    ##   ###   ###    ##    ##   ###
    // #  #   #    ##     #     #  #  #  #  #  #  # ##  #      #
    // #  #   #      ##   #     #  #  #  #  #  #  ##    #      #
    //  ###  ###   ###     ##    ##   #  #  #  #   ##    ##     ##
    /**
     * Processes the disconnect stat.
     * @param {string} ip The IP address of the server to update.
     * @param {object} data The connect data.
     * @returns {Promise} A promise that resolves when the stat has been processed.
     */
    static async disconnect(ip, data) {
        const game = await Game.getGame(ip),
            player = game.getPlayer(data.player);

        if (!game.end) {
            player.disconnected = true;
            player.connected = false;
            data.description = `${data.player} disconnected.`;
            game.events.push(data);
        }
    }

    //                #   ##
    //                #  #  #
    //  ##   ###    ###  #      ###  # #    ##
    // # ##  #  #  #  #  # ##  #  #  ####  # ##
    // ##    #  #  #  #  #  #  # ##  #  #  ##
    //  ##   #  #   ###   ###   # #  #  #   ##
    /**
     * Processes the end game stat.
     * @param {string} ip The IP address of the server to update.
     * @param {{start: Date, end: Date, damage: object[], kills: object[], goals: object[], flagStats: object[], teamScore: object, teamChanges: object[], players: object[], id: number?}} data The end game data.
     * @returns {Promise} A promise that resolves when the stat has been processed.
     */
    static async endGame(ip, data) {
        const {start, end, damage, kills, goals, flagStats, teamChanges } = data,
            game = await Game.getGame(ip);

        game.start = start;
        game.end = end;
        game.damage = damage || [];
        game.kills = kills || [];
        game.goals = goals || [];
        game.flagStats = flagStats || [];
        game.teamChanges = teamChanges || [];

        game.damage.forEach((stat) => {
            stat.weapon = Weapon.weaponNames[Weapon.weapons.indexOf(stat.weapon)];
        });

        // Regenerate players and teamScore arrays in case our data is out of sync from the server due to dropped packets, restarted tracker, etc.
        game.players = [];

        const hasEvents = game.events.length > 0;

        game.kills.forEach((kill) => {
            const attackerPlayer = game.getPlayer(kill.attacker, kill.attackerTeam),
                defenderPlayer = game.getPlayer(kill.defender, kill.defenderTeam),
                assistedPlayer = game.getPlayer(kill.assisted, kill.assistedTeam);

            if (!attackerPlayer || !defenderPlayer) {
                return;
            }

            if (kill.attacker === kill.defender) {
                attackerPlayer.kills--;
                defenderPlayer.deaths++;
            } else {
                attackerPlayer.kills++;
                defenderPlayer.deaths++;

                if (assistedPlayer) {
                    assistedPlayer.assists++;
                }
            }

            if (!hasEvents) {
                const ev = JSON.parse(JSON.stringify(kill));
                ev.description = `${kill.attacker} killed ${kill.defender} with ${kill.weapon}.${kill.assisted ? ` Assisted by ${kill.assisted}.` : ""}`;
                game.events.push(ev);
            }
        });

        game.teamChanges.forEach((teamChange) => {
            if (!hasEvents) {
                const ev = JSON.parse(JSON.stringify(teamChange));
                ev.description = `${teamChange.playerName} changed from ${teamChange.previousTeam} to ${teamChange.currentTeam} team`;
                game.events.push(ev);
            }
        });

        switch (game.settings.matchMode) {
            case "TEAM ANARCHY": {
                game.teamScore = {};

                const teams = game.kills.map((k) => k.attackerTeam).concat(game.kills.map((k) => k.defenderTeam)).concat(game.kills.map((k) => k.assistedTeam)).filter((k) => k).filter((k, index, self) => self.indexOf(k) === index);

                teams.forEach((team) => {
                    game.teamScore[team] = game.kills.filter((k) => k.attackerTeam === team && k.defenderTeam !== team).length - game.kills.filter((k) => k.attackerTeam === team && k.defenderTeam === team).length;
                });

                break;
            } case "MONSTERBALL":
                game.teamScore = {
                    "BLUE": game.goals.filter((g) => g.scorerTeam === "BLUE" && !g.blunder || g.scorerTeam === "ORANGE" && g.blunder).length,
                    "ORANGE": game.goals.filter((g) => g.scorerTeam === "ORANGE" && !g.blunder || g.scorerTeam === "BLUE" && g.blunder).length
                };

                game.goals.forEach((goal) => {
                    const scorerPlayer = game.getPlayer(goal.scorer, goal.scorerTeam),
                        assistedPlayer = game.getPlayer(goal.assisted, goal.assistedTeam);

                    if (goal.blunder) {
                        scorerPlayer.blunders++;
                    } else {
                        scorerPlayer.goals++;
                    }

                    if (assistedPlayer) {
                        assistedPlayer.goalAssists++;
                    }

                    if (!hasEvents) {
                        const ev = JSON.parse(JSON.stringify(goal));

                        if (goal.blunder) {
                            const otherTeam = goal.scorerTeam === "BLUE" ? "ORANGE" : "BLUE";
                            ev.description = `BLUNDER! ${goal.scorer} own goals for ${otherTeam}!`;
                        } else {
                            ev.description = `GOAL! ${goal.scorer} scored for ${goal.scorerTeam}!${goal.assisted ? ` Assisted by ${goal.assisted}.` : ""}`;
                        }

                        game.events.push(ev);
                    }
                });

                break;
            case "CTF":
                game.teamScore = {
                    "BLUE": game.flagStats.filter((f) => f.scorerTeam === "BLUE" && f.event === "Capture").length,
                    "ORANGE": game.flagStats.filter((f) => f.scorerTeam === "ORANGE" && f.event === "Capture").length
                };

                game.flagStats.forEach((flag) => {
                    if (!flag.scorer) {
                        return;
                    }

                    const scorerPlayer = game.getPlayer(flag.scorer, flag.scorerTeam);

                    switch (flag.event) {
                        case "Capture":
                            scorerPlayer.captures++;
                            break;
                        case "Pickup":
                            scorerPlayer.pickups++;
                            break;
                        case "CarrierKill":
                            scorerPlayer.carrierKills++;
                            break;
                        case "Return":
                            scorerPlayer.returns++;
                            break;
                    }

                    if (!hasEvents) {
                        const ev = JSON.parse(JSON.stringify(flag));

                        switch (flag.event) {
                            case "Return":
                                ev.description = `${flag.scorer} returned the ${flag.scorerTeam} flag.`;
                                break;
                            case "Pickup": {
                                const otherTeam = flag.scorerTeam === "BLUE" ? "ORANGE" : "BLUE";
                                ev.description = `${flag.scorer} picked up the ${otherTeam} flag.`;
                                break;
                            } case "Capture":
                                ev.description = `${flag.scorer} scores for ${flag.scorerTeam}!`;
                                break;
                            case "CarrierKill": {
                                const otherTeam = flag.scorerTeam === "BLUE" ? "ORANGE" : "BLUE";
                                ev.description = `${flag.scorer} killed the ${otherTeam} flag carrier!`;
                                break;
                            }
                        }

                        game.events.push(ev);
                    }
                });

                break;
        }



        data.teamScore = game.teamScore;
        data.players = game.players;

        if (game.events.length > 0 && game.players.length > 0) {
            data.id = await Db.add(ip, game);
        }

        game.remove();
    }

    //              #     #     ##
    //                    #    #  #
    //  ##   #  #  ##    ###   #      ###  # #    ##
    // # ##   ##    #     #    # ##  #  #  ####  # ##
    // ##     ##    #     #    #  #  # ##  #  #  ##
    //  ##   #  #  ###     ##   ###   # #  #  #   ##
    /**
     * Removes a game.
     * @param {string} ip The IP address of the game to remove.
     * @returns {Promise} A promise that resolves when the game has been removed.
     */
    static async exitGame(ip) {
        const game = await Game.getGame(ip);
        game.remove();
    }

    //                   ##
    //                    #
    //  ###   ##    ###   #
    // #  #  #  #  #  #   #
    //  ##   #  #  # ##   #
    // #      ##    # #  ###
    //  ###
    /**
     * Processes the goal stat.
     * @param {string} ip The IP address of the server to update.
     * @param {object} data The goal data.
     * @returns {Promise} A promise that resolves when the stat has been processed.
     */
    static async goal(ip, data) {
        const {scorer, scorerTeam, assisted, assistedTeam} = data,
            game = await Game.getGame(ip);

        if (!game.settings) {
            game.settings = {matchMode: "ANARCHY"};
        }

        if (!game.settings.matchMode) {
            game.settings.matchMode = "ANARCHY";
        }

        if (game.settings.matchMode !== "MONSTERBALL") {
            game.settings.matchMode = "MONSTERBALL";
            game.teamScore = {"BLUE": 0, "ORANGE": 0};
        }

        const scorerPlayer = game.getPlayer(scorer),
            assistedPlayer = game.getPlayer(assisted);

        scorerPlayer.team = scorerTeam;
        if (assistedPlayer) {
            assistedPlayer.team = assistedTeam;
        }

        scorerPlayer.goals++;
        if (assistedPlayer) {
            assistedPlayer.goalAssists++;
        }

        if (game.teamScore[scorerTeam]) {
            game.teamScore[scorerTeam]++;
        } else {
            game.teamScore[scorerTeam] = 1;
        }

        game.goals.push(data);
        data.description = `GOAL! ${scorer} scored for ${scorerTeam}!${assisted ? ` Assisted by ${assisted}.` : ""}`;
        game.events.push(data);
    }

    // #      #    ##    ##
    // #            #     #
    // # #   ##     #     #
    // ##     #     #     #
    // # #    #     #     #
    // #  #  ###   ###   ###
    /**
     * Processes the kill stat.
     * @param {string} ip The IP address of the server to update.
     * @param {object} data The kill data.
     * @returns {Promise} A promise that resolves when the stat has been processed.
     */
    static async kill(ip, data) {
        data.weapon = Weapon.weaponNames[Weapon.weapons.indexOf(data.weapon)];

        const {attacker, attackerTeam, defender, defenderTeam, assisted, assistedTeam, weapon} = data,
            game = await Game.getGame(ip);

        if (!game.settings) {
            game.settings = {matchMode: "ANARCHY"};
        }

        if (!game.settings.matchMode) {
            game.settings.matchMode = "ANARCHY";
        }

        if (game.settings.matchMode === "ANARCHY" && (attackerTeam || defenderTeam)) {
            game.settings.matchMode = "TEAM ANARCHY";
        }

        const attackerPlayer = game.getPlayer(attacker),
            defenderPlayer = game.getPlayer(defender),
            assistedPlayer = game.getPlayer(assisted);

        attackerPlayer.team = attackerTeam;
        defenderPlayer.team = defenderTeam;
        if (assistedPlayer) {
            assistedPlayer.team = assistedTeam;
        }

        if (attackerTeam && !game.teamScore[attackerTeam]) {
            game.teamScore[attackerTeam] = 0;
        }
        if (defenderTeam && !game.teamScore[defenderTeam]) {
            game.teamScore[defenderTeam] = 0;
        }

        if (attackerTeam && attackerTeam !== "ANARCHY" && attackerTeam === defenderTeam || attacker === defender) {
            attackerPlayer.kills--;
            defenderPlayer.deaths++;

            if ((!game.settings || !game.settings.matchMode || game.settings.matchMode !== "MONSTERBALL" && game.settings.matchMode !== "CTF") && attackerTeam && attackerTeam !== "ANARCHY") {
                if (game.teamScore[attackerTeam]) {
                    game.teamScore[attackerTeam]--;
                } else {
                    game.teamScore[attackerTeam] = -1;
                }
            }
        } else {
            attackerPlayer.kills++;
            defenderPlayer.deaths++;
            if (assistedPlayer) {
                assistedPlayer.assists++;
            }

            if ((!game.settings || !game.settings.matchMode || game.settings.matchMode !== "MONSTERBALL" && game.settings.matchMode !== "CTF") && attackerTeam && attackerTeam !== "ANARCHY") {
                if (game.teamScore[attackerTeam]) {
                    game.teamScore[attackerTeam]++;
                } else {
                    game.teamScore[attackerTeam] = 1;
                }
            }
        }

        game.kills.push(data);
        data.description = `${attacker} killed ${defender} with ${weapon}.${assisted ? ` Assisted by ${assisted}.` : ""}`;
        game.events.push(data);
    }

    //                                              ##    #           #
    //                                             #  #   #           #
    // ###   ###    ##    ##    ##    ###    ###    #    ###    ###  ###
    // #  #  #  #  #  #  #     # ##  ##     ##       #    #    #  #   #
    // #  #  #     #  #  #     ##      ##     ##   #  #   #    # ##   #
    // ###   #      ##    ##    ##   ###    ###     ##     ##   # #    ##
    // #
    /**
     * Processes a stat sent from a server.
     * @param {string} ip The IP address of the server to update.
     * @param {object} data The stat data.
     * @returns {Promise} A promise that resolves when the stat has been processed.
     */
    static async processStat(ip, data) {
        if (!Game.getByIp(ip) && data.type !== "StartGame" && data.type !== "LobbyStatus") {
            if (data.type === "LobbyExit" || data.type === "Disconnect") {
                return;
            }

            await Stats.startGame(ip, {matchMode: "ANARCHY"});

            Websocket.broadcast({ip, data: {
                matchMode: "ANARCHY",
                name: "Stats",
                type: "StartGame"
            }});
        }

        if (data.name === "Stats") {
            switch (data.type) {
                case "StartGame":
                case "LobbyStatus":
                    await Stats.startGame(ip, data);
                    break;
                case "Kill":
                    await Stats.kill(ip, data);
                    break;
                case "Goal":
                    await Stats.goal(ip, data);
                    break;
                case "Blunder":
                    await Stats.blunder(ip, data);
                    break;
                case "CTF":
                    await Stats.ctf(ip, data);
                    break;
                case "Connect":
                    await Stats.connect(ip, data);
                    break;
                case "Disconnect":
                    await Stats.disconnect(ip, data);
                    break;
                case "EndGame":
                    await Stats.endGame(ip, data);
                    break;
                case "LobbyExit":
                    await Stats.exitGame(ip);
                    break;
                case "TeamChange":
                    await Stats.teamChange(ip, data);
            }

            Websocket.broadcast({ip, data});
        }
    }

    //         #                 #     ##
    //         #                 #    #  #
    //  ###   ###    ###  ###   ###   #      ###  # #    ##
    // ##      #    #  #  #  #   #    # ##  #  #  ####  # ##
    //   ##    #    # ##  #      #    #  #  # ##  #  #  ##
    // ###      ##   # #  #       ##   ###   # #  #  #   ##
    /**
     * Processes the start game stat.
     * @param {string} ip The IP address of the server to update.
     * @param {object} data The start game data.
     * @returns {Promise} A promise that resolves when the stat has been processed.
     */
    static async startGame(ip, data) {
        const game = await Game.getGame(ip);

        if (data.timeLimit && data.timeLimit === 2147483647) {
            delete data.timeLimit;
        }

        game.settings = data;
        game.inLobby = data.type === "LobbyStatus";

        game.players = data.players && data.players.map((player) => new Player({
            name: player,
            kills: 0,
            assists: 0,
            deaths: 0,
            goals: 0,
            goalAssists: 0,
            blunders: 0,
            returns: 0,
            pickups: 0,
            captures: 0,
            carrierKills: 0
        })) || [];

        if (!game.inLobby) {
            if (game.settings.timeLimit) {
                game.projectedEnd = new Date();
                game.projectedEnd.setSeconds(game.projectedEnd.getSeconds() + game.settings.timeLimit);
                game.countdown = game.settings.timeLimit * 1000;

                if (["CTF", "MONSTERBALL"].indexOf(game.settings.matchMode) !== -1) {
                    game.teamScore = {"BLUE": 0, "ORANGE": 0};
                }
            } else {
                game.startTime = new Date();
                game.elapsed = 0;
            }
        }

        data.server = game.server;
        data.condition = Game.getCondition(game);
        data.countdown = game.countdown;
        data.elapsed = game.elapsed;
    }
}

module.exports = Stats;

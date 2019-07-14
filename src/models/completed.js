const Db = require("../database/completed"),
    Game = require("./game"),
    Player = require("./player");

//   ###                         ##            #                #
//  #   #                         #            #                #
//  #       ###   ## #   # ##     #     ###   ####    ###    ## #
//  #      #   #  # # #  ##  #    #    #   #   #     #   #  #  ##
//  #      #   #  # # #  ##  #    #    #####   #     #####  #   #
//  #   #  #   #  # # #  # ##     #    #       #  #  #      #  ##
//   ###    ###   #   #  #       ###    ###     ##    ###    ## #
//                       #
//                       #
/**
 * A class that represents a completed match.
 */
class Completed {
    // #     ##                   #
    // #      #                   #
    // ###    #    #  #  ###    ###   ##   ###
    // #  #   #    #  #  #  #  #  #  # ##  #  #
    // #  #   #    #  #  #  #  #  #  ##    #
    // ###   ###    ###  #  #   ###   ##   #
    /**
     * Processes the blunder stat.
     * @param {string} ip The IP address of the server to update.
     * @param {{time: number, scorer: string, scorerTeam: string}} data The blunder data.
     * @returns {Promise} A promise that resolves when the stat has been processed.
     */
    static async blunder(ip, data) {
        const {scorer, scorerTeam} = data,
            game = await Game.getGame(ip);

        game.events.push(data);
        game.goals.push(data);

        const scorerPlayer = Completed.getPlayer(game, scorer);

        scorerPlayer.team = scorerTeam;

        scorerPlayer.blunders++;

        const otherTeam = scorerTeam === "BLUE" ? "ORANGE" : "BLUE";

        if (game.teamScore[otherTeam]) {
            game.teamScore[otherTeam]++;
        } else {
            game.teamScore[otherTeam] = 1;
        }

        // TODO: Notify.
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
     * @param {{time: number, player: string}} data The connect data.
     * @returns {Promise} A promise that resolves when the stat has been processed.
     */
    static async connect(ip, data) {
        const game = await Game.getGame(ip);

        game.events.push(data);

        // TODO: Notify.
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
     * @param {{time: number, player: string}} data The connect data.
     * @returns {Promise} A promise that resolves when the stat has been processed.
     */
    static async disconnect(ip, data) {
        const game = await Game.getGame(ip);

        game.events.push(data);

        // TODO: Notify.
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
     * @param {{start: Date, end: Date, damage: object[], kills: object[], goals: object[]}} data The end game data.
     * @returns {Promise} A promise that resolves when the stat has been processed.
     */
    static async endGame(ip, data) {
        const {start, end, damage, kills, goals} = data,
            game = await Game.getGame(ip);

        game.start = start;
        game.end = end;
        game.damage = damage;
        game.kills = kills;
        game.goals = goals;

        await Db.add(ip, game);
    }

    //              #    ###   ##
    //              #    #  #   #
    //  ###   ##   ###   #  #   #     ###  #  #   ##   ###
    // #  #  # ##   #    ###    #    #  #  #  #  # ##  #  #
    //  ##   ##     #    #      #    # ##   # #  ##    #
    // #      ##     ##  #     ###    # #    #    ##   #
    //  ###                                 #
    /**
     * Retrieves a player from a game.
     * @param {Game} game The game to find the player in.
     * @param {string} name The name of the player.
     * @returns {Player} The player.
     */
    static getPlayer(game, name) {
        if (!game.players.find((p) => p.name === name)) {
            game.players.push(new Player({
                name,
                kills: 0,
                assists: 0,
                deaths: 0,
                goals: 0,
                goalAssists: 0,
                blunders: 0
            }));
        }

        return game.players.find((p) => p.name === name);
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
     * @param {{time: number, scorer: string, scorerTeam: string, assisted: string, assistedTeam: string}} data The goal data.
     * @returns {Promise} A promise that resolves when the stat has been processed.
     */
    static async goal(ip, data) {
        const {scorer, scorerTeam, assisted, assistedTeam} = data,
            game = await Game.getGame(ip);

        game.events.push(data);
        game.goals.push(data);

        const scorerPlayer = Completed.getPlayer(game, scorer),
            assistedPlayer = Completed.getPlayer(game, assisted);

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

        // TODO: Notify.
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
     * @param {{time: number, attacker: string, attackerTeam: string, defender: string, defenderTeam: string, assisted: string, assistedTeam: string, weapon: string}} data The kill data.
     * @returns {Promise} A promise that resolves when the stat has been processed.
     */
    static async kill(ip, data) {
        const {attacker, attackerTeam, defender, defenderTeam, assisted, assistedTeam} = data,
            game = await Game.getGame(ip);

        game.events.push(data);
        game.kills.push(data);

        const attackerPlayer = Completed.getPlayer(game, attacker),
            defenderPlayer = Completed.getPlayer(game, defender),
            assistedPlayer = Completed.getPlayer(game, assisted);

        attackerPlayer.team = attackerTeam;
        defenderPlayer.team = defenderTeam;
        if (assistedPlayer) {
            assistedPlayer.team = assistedTeam;
        }

        if (attackerTeam && attackerTeam !== "ANARCHY" && attackerTeam === defenderTeam) {
            attackerPlayer.kills--;
            defenderPlayer.deaths++;

            if (attackerTeam && attackerTeam !== "ANARCHY") {
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

            if (attackerTeam && attackerTeam !== "ANARCHY") {
                if (game.teamScore[attackerTeam]) {
                    game.teamScore[attackerTeam]++;
                } else {
                    game.teamScore[attackerTeam] = 1;
                }
            }
        }

        // TODO: Notify.
    }

    //              #     #      #
    //              #           # #
    // ###    ##   ###   ##     #    #  #
    // #  #  #  #   #     #    ###   #  #
    // #  #  #  #   #     #     #     # #
    // #  #   ##     ##  ###    #      #
    //                                #
    /**
     * Notify clients that a score has been updated.
     * @param {Game} game The game to update.
     * @param {object} data The data provided with the update.
     * @returns {void}
     */
    static notify(game, data) {
        // TODO
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
        if (data.name === "Stats") {
            switch (data.type) {
                case "StartGame":
                    await Completed.startGame(ip, data);
                    break;
                case "Kill":
                    await Completed.kill(ip, data);
                    break;
                case "Goal":
                    await Completed.goal(ip, data);
                    break;
                case "Blunder":
                    await Completed.blunder(ip, data);
                    break;
                case "Connect":
                    await Completed.connect(ip, data);
                    break;
                case "Disconect":
                    await Completed.disconnect(ip, data);
                    break;
                case "EndGame":
                    await Completed.endGame(ip, data);
                    break;
            }
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

        game.settings = data;
        game.players = data.players.map((player) => new Player({
            name: player,
            kills: 0,
            assists: 0,
            deaths: 0,
            goals: 0,
            goalAssists: 0,
            blunders: 0,
            connected: data.time
        }));

        // TODO: Notify.
    }
}

module.exports = Completed;
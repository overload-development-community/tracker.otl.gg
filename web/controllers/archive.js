const Common = require("../includes/common"),
    Completed = require("../../src/models/completed"),
    ArchiveView = require("../../public/views/archive.js"),
    NotFoundView = require("../../public/views/404"),
    Weapon = require("../../src/models/weapon");

/**
 * @typedef {import("express").Request} express.Request
 * @typedef {import("express").Response} express.Response
 */

//    #                  #        #
//   # #                 #
//  #   #  # ##    ###   # ##    ##    #   #   ###
//  #   #  ##  #  #   #  ##  #    #    #   #  #   #
//  #####  #      #      #   #    #     # #   #####
//  #   #  #      #   #  #   #    #     # #   #
//  #   #  #       ###   #   #   ###     #     ###
/**
 * A class that represents an archived game's page.
 */
class Archive {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Processes the request.
     * @param {express.Request} req The request.
     * @param {express.Response} res The response.
     * @returns {Promise} A promise that resolves when the request is complete.
     */
    static async get(req, res) {
        if (isNaN(Number.parseInt(req.params.id, 10))) {
            res.status(404).send(await Common.page(
                "",
                {
                    css: ["/css/error.css"]
                },
                NotFoundView.get({message: "Game not found."}),
                req
            ));
            return;
        }

        const game = await Completed.getById(Number.parseInt(req.params.id, 10));

        if (!game) {
            res.status(404).send(await Common.page(
                "",
                {
                    css: ["/css/error.css"]
                },
                NotFoundView.get({message: "Game not found."}),
                req
            ));
            return;
        }

        let weapons = [];
        if (game.damage) {
            weapons = game.damage.map((d) => d.weapon).filter((w, index, arr) => arr.indexOf(w) === index).sort((a, b) => Weapon.orderedWeapons.indexOf(a) - Weapon.orderedWeapons.indexOf(b));

            // Only include damage where the defender is known.
            game.damage = game.damage.filter(d => d.getPlayer(d.defender));
        }

        let gameLength = game.settings && game.settings.timeLimit && game.settings.timeLimit || 0;

        if (game.end && game.start) {
            gameLength = gameLength === 0 ? (new Date(game.end).getTime() - new Date(game.start).getTime()) / 1000 : Math.min((new Date(game.end).getTime() - new Date(game.start).getTime()) / 1000, gameLength);
        }

        for (const player of game.players) {
            player.timeInGame = gameLength;

            const events = game.events.filter((e) => ["Connect", "Disconnect"].indexOf(e.type) !== -1 && e.player === player.name).sort((a, b) => a.time - b.time);

            if (events.length === 0) {
                continue;
            }

            let status = "Connect",
                time = 0;

            if (events[0].type === "Connect") {
                time = events[0].time;

                events.shift();
            }

            player.timeInGame = 0;

            while (events.length > 0) {
                if (events[0].type === status || events[0].time > gameLength) {
                    events.shift();
                    continue;
                }

                switch (events[0].type) {
                    case "Connect":
                        status = "Connect";
                        time = events[0].time;
                        break;
                    case "Disconnect":
                        status = "Disconnect";
                        player.timeInGame += events[0].time - time;
                        break;
                }

                events.shift();
            }

            if (status === "Connect") {
                player.timeInGame += gameLength - time;
            }
        }

        res.status(200).send(await Common.page(
            "",
            {
                js: [
                    "/js/common/timeago.min.js",
                    "/js/common/chart.js",
                    "/views/common/score.js",
                    "/views/common/playerCount.js",
                    "/views/common/completedDetails.js",
                    "/views/common/players.js",
                    "/views/common/events.js",
                    "/js/archive.js"
                ],
                css: ["/css/game.css"]
            },
            ArchiveView.get(game, weapons),
            req
        ));
    }
}

Archive.route = {
    path: "/archive/:id"
};

module.exports = Archive;

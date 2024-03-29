/**
 * @typedef {import("express").Request} express.Request
 * @typedef {import("express").Response} express.Response
 */

const Common = require("../includes/common"),
    GameModel = require("../../public/js/common/game"),
    GameView = require("../../public/views/game"),
    NotFoundView = require("../../public/views/404"),
    RouterBase = require("hot-router").RouterBase;

//   ###
//  #   #
//  #       ###   ## #    ###
//  #          #  # # #  #   #
//  #  ##   ####  # # #  #####
//  #   #  #   #  # # #  #
//   ###    ####  #   #   ###
/**
 * A class that represents the game page.
 */
class Game extends RouterBase {
    //                    #
    //                    #
    // ###    ##   #  #  ###    ##
    // #  #  #  #  #  #   #    # ##
    // #     #  #  #  #   #    ##
    // #      ##    ###    ##   ##
    /**
     * Retrieves the route parameters for the class.
     * @returns {RouterBase.Route} The route parameters.
     */
    static get route() {
        const route = {...super.route};

        route.path = "/game/:ip";

        return route;
    }

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
     * @returns {Promise} A promise that resolves when the request is processed
     */
    static async get(req, res) {
        const ip = req.params.ip,
            gameModel = GameModel.getByIp(ip);

        /** @type {GameModel} */
        let game;
        try {
            game = JSON.parse(JSON.stringify(gameModel));
        } catch (err) {
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

        if (game.projectedEnd) {
            game.countdown = new Date(game.projectedEnd).getTime() - new Date().getTime();
            delete game.projectedEnd;
        }

        if (game.startTime) {
            game.elapsed = new Date().getTime() - new Date(game.startTime).getTime();
            delete game.startTime;
        }

        game.condition = GameModel.getCondition(game);

        res.setHeader("Cache-Control", "no-cache, max-age=0, must-revalidate, no-store");

        res.status(200).send(await Common.page(
            "",
            {
                js: [
                    "/js/common/timeago.min.js",
                    "/js/common/clipboard.min.js",
                    "/js/common/encoding.js",
                    "/js/common/clipboardHandler.js",
                    "/js/common/websocketclient.js",
                    "/js/common/time.js",
                    "/js/common/countdown.js",
                    "/js/common/elapsed.js",
                    "/js/common/player.js",
                    "/js/common/game.js",
                    "/views/common/score.js",
                    "/views/common/playerCount.js",
                    "/views/common/details.js",
                    "/views/common/players.js",
                    "/views/common/events.js",
                    "/js/game.js"
                ],
                css: ["/css/game.css"]
            },
            GameView.get(game),
            req
        ));
    }
}

module.exports = Game;

/**
 * @typedef {import("express").Request} express.Request
 * @typedef {import("express").Response} express.Response
 */

const Completed = require("../../src/models/completed"),
    Log = require("@roncli/node-application-insights-logger"),
    RouterBase = require("hot-router").RouterBase;

//   ###                        #        #            #       #             #
//  #   #                       #                     #      # #
//  #       ###   ## #    ###   #       ##     ###   ####   #   #  # ##    ##
//  #          #  # # #  #   #  #        #    #       #     #   #  ##  #    #
//  #  ##   ####  # # #  #####  #        #     ###    #     #####  ##  #    #
//  #   #  #   #  # # #  #      #        #        #   #  #  #   #  # ##     #
//   ###    ####  #   #   ###   #####   ###   ####     ##   #   #  #       ###
//                                                                 #
//                                                                 #
/**
 * A class that handles calls to the website's game list API.
 */
class GameListApi extends RouterBase {
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

        route.path = "/api/gamelist";

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
     * @returns {Promise} A promise that resolves when the request is complete.
     */
    static async get(req, res) {
        try {
            const page = Number.parseInt(`${req.query.page}`, 10);
            if (isNaN(page)) {
                res.status(400).send("400 - Bad Request - Invalid querystring.");
                return;
            }

            if (!page) {
                res.status(400).send("400 - Bad Request - Invalid querystring.");
                return;
            }

            const games = (await Completed.getList(page)).games;

            res.status(200).json({games});
        } catch (err) {
            res.status(500).json({error: "Server error."});
            Log.error(`An error occurred while posting to ${req.method} ${GameListApi.route.path}.`, {err});
        }
    }
}

module.exports = GameListApi;

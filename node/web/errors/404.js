/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Common = require("../includes/common"),
    NotFoundView = require("../../public/views/404"),
    RouterBase = require("hot-router").RouterBase;

//  #   #          #     #####                           #
//  #   #          #     #                               #
//  ##  #   ###   ####   #       ###   #   #  # ##    ## #
//  # # #  #   #   #     ####   #   #  #   #  ##  #  #  ##
//  #  ##  #   #   #     #      #   #  #   #  #   #  #   #
//  #   #  #   #   #  #  #      #   #  #  ##  #   #  #  ##
//  #   #   ###     ##   #       ###    ## #  #   #   ## #
/**
 * A class that represents the 404 page.
 */
class NotFound extends RouterBase {
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

        route.notFound = true;

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
     * @param {Express.Request} req The request.
     * @param {Express.Response} res The response.
     * @returns {Promise} A promise that resolves when the request is processed
     */
    static async get(req, res) {
        res.status(404).send(await Common.page(
            "",
            {
                css: ["/css/error.css"]
            },
            NotFoundView.get({message: "This page does not exist."}),
            req
        ));
    }
}

module.exports = NotFound;

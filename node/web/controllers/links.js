/**
 * @typedef {import("express").Request} express.Request
 * @typedef {import("express").Response} express.Response
 */

const Common = require("../includes/common"),
    LinksView = require("../../public/views/links"),
    RouterBase = require("hot-router").RouterBase;

//  #        #           #
//  #                    #
//  #       ##    # ##   #   #   ###
//  #        #    ##  #  #  #   #
//  #        #    #   #  ###     ###
//  #        #    #   #  #  #       #
//  #####   ###   #   #  #   #  ####
/**
 * A class that represents the links page.
 */
class Links extends RouterBase {
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

        route.path = "/links";

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
        res.status(200).send(await Common.page("", {}, LinksView.get(), req));
    }
}

module.exports = Links;

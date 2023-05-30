const ChallengeModeModel = require("../../src/models/challengemode");

/**
 * @typedef {import("express").Request} express.Request
 * @typedef {import("express").Response} express.Response
 */

/**
 * A class that handles calls to the website's challenge mode run API.
 */
class ChallengeModeRun {
    /**
     * Processes the request.
     * @param {express.Request} req The request.
     * @param {express.Response} res The response.
     * @returns {Promise} A promise that resolves when the request is complete.
     */
    static async post(req, res) {
        if (!req.body) {
            res.status(400).send("400 - Bad Request - Invalid body.");
            return;
        }
        await ChallengeModeModel.insertRun(req.body);

        res.status(204).send();
    }
}

ChallengeModeRun.route = {
    path: "/api/challengemoderun"
};

module.exports = ChallengeModeRun;
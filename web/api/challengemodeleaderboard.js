const ChallengeModeModel = require("../../src/models/challengemode");

/**
 * @typedef {import("express").Request} express.Request
 * @typedef {import("express").Response} express.Response
 */

/**
 * A class that handles calls to the website's challenge mode leaderboard API.
 */
class ChallengeModeLeaderboard {
    /**
     * Processes the request.
     * @param {express.Request} req The request.
     * @param {express.Response} res The response.
     * @returns {Promise} A promise that resolves when the request is complete.
     */
    static async get(req, res) {
        const data = await ChallengeModeModel.getLeaderboard(req.query.levelHash, req.query.difficultyLevelId, req.query.modeId);

        res.status(200).json(data);
    }
}

ChallengeModeLeaderboard.route = {
    path: "/api/challengemodeleaderboard"
};

module.exports = ChallengeModeLeaderboard;
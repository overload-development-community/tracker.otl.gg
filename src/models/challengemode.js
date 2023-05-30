const Db = require("../database/challengemode");

/**
 * A class that represents challenge mode.
 */
class ChallengeMode {
    /**
     * Get leaderboard data.
     * @param {string} levelHash The level hash.
     * @param {number} difficultyLevelId The difficulty level.
     * @param {number} modeId The CM mode (e.g. countdown, infinite, future)
     * @returns {Promise} A promise that resolves when the leaderboard has been processed.
     */
    static async getLeaderboard(levelHash, difficultyLevelId, modeId) {
        return await Db.getLeaderboard(levelHash, difficultyLevelId, modeId);
    }

    /**
     * Process inserting a run.
     * @param {object} data The run data.
     * @returns {Promise} A promise that resolves when the run has been processed.
     */
    static async insertRun(data) {
        return await Db.insertRun(data);
    }
}

module.exports = ChallengeMode;
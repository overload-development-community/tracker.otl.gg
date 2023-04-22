const Db = require("@roncli/node-database"),
    db = require("./index");

/**
 * A class that handles calls to the database for challenge mode.
 */
class ChallengeModeDb {
    static async insertRun(data) {
        await db.query(/* sql */`
            INSERT INTO tblChallengeModeRuns (Data)
            VALUES (@data)
        `, {
            data: { type: Db.NVARCHAR, value: JSON.stringify(data) }
        });
    }

    static async getLeaderboard(levelHash, difficultyLevelId, modeId) {
        const result = await db.query(/* sql */`
            SELECT Data FROM tblChallengeModeRuns
            WHERE JSON_VALUE(Data, '$.levelHash') = @levelHash AND
                  JSON_VALUE(Data, '$.difficultyLevelId') = @difficultyLevelId AND
                  JSON_VALUE(Data, '$.modeId') = @modeId
            ORDER BY JSON_VALUE(Data, '$.score') DESC
        `, {
            levelHash: { type: Db.NVARCHAR, value: levelHash },
            difficultyLevelId: { type: Db.INT, value: difficultyLevelId },
            modeId: { type: Db.INT, value: modeId }
        });

        return result && result.recordsets && result.recordsets[0] && result.recordsets[0].map((row) => (JSON.parse(row.Data))) || [];
    }
}

module.exports = ChallengeModeDb;
//  ####    ##                                       #   #    #
//  #   #    #                                       #   #
//  #   #    #     ###   #   #   ###   # ##    ###   #   #   ##     ###   #   #
//  ####     #        #  #   #  #   #  ##  #  #       # #     #    #   #  #   #
//  #        #     ####  #  ##  #####  #       ###    # #     #    #####  # # #
//  #        #    #   #   ## #  #      #          #   # #     #    #      # # #
//  #       ###    ####      #   ###   #      ####     #     ###    ###    # #
//                       #   #
//                        ###
/**
 * A class that represents the game players view.
 */
class PlayersView {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the rendered players template.
     * @param {object} game The game to display.
     * @returns {string} An HTML string of the rendered players template.
     */
    static get(game) {
        return /* html */`
            <div class="table" style="grid-template-columns: repeat(${5 + (game.settings && game.settings.matchMode !== "ANARCHY" ? 1 : 0) + (game.settings && game.settings.matchMode === "MONSTERBALL" ? 3 : 0) + (game.settings && game.settings.matchMode === "CTF" ? 4 : 0)}, auto);">
                <div class="name header">Player</div>
                ${game.settings && game.settings.matchMode !== "ANARCHY" ? /* html */`
                    <div class="team header">Team</div>
                ` : ""}
                ${game.settings && game.settings.matchMode === "MONSTERBALL" ? /* html */`
                    <div class="goals header">Goals</div>
                    <div class="goalAssists header">Goal Assists</div>
                    <div class="blunders header">Blunders</div>
                ` : ""}
                ${game.settings && game.settings.matchMode === "CTF" ? /* html */`
                    <div class="captures header">Captures</div>
                    <div class="pickups header">Pickups</div>
                    <div class="carrierKills header">Carrier Kills</div>
                    <div class="returns header">Returns</div>
                ` : ""}
                <div class="kills header">Kills</div>
                <div class="assists header">Assists</div>
                <div class="deaths header">Deaths</div>
                <div class="timeInGame header">Time In Game</div>
                ${game.players && game.players.sort((a, b) => b.goals - a.goals || b.goalAssists - a.goalAssists || a.blunders - b.blunders || b.captures - a.captures || b.kills - a.kills || b.assists - a.assists || a.deaths - b.deaths || a.name.toString().localeCompare(b.name)).map((player) => /* html */`
                    <div class="name">${PlayersView.Common.htmlEncode(player.name)}</div>
                    ${game.settings && game.settings.matchMode !== "ANARCHY" ? /* html */`
                        <div class="team">${player.team ? PlayersView.Common.htmlEncode(player.team) : ""}</div>
                    ` : ""}
                    ${game.settings && game.settings.matchMode === "MONSTERBALL" ? /* html */`
                        <div class="goals">${player.goals}</div>
                        <div class="goalAssists">${player.goalAssists}</div>
                        <div class="blunders">${player.blunders}</div>
                    ` : ""}
                    ${game.settings && game.settings.matchMode === "CTF" ? /* html */`
                        <div class="captures">${player.captures}</div>
                        <div class="pickups">${player.pickups}</div>
                        <div class="carrierKills">${player.carrierKills}</div>
                        <div class="returns">${player.returns}</div>
                    ` : ""}
                    <div class="kills">${player.kills}</div>
                    <div class="assists">${player.assists}</div>
                    <div class="deaths">${player.deaths}</div>
                    <div class="timeInGame">${PlayersView.Common.formatTimeSpan(player.timeInGame, 0)}</div>
                `).join("") || ""}
            </div>
        `;
    }
}

// @ts-ignore
PlayersView.Common = typeof Common === "undefined" ? require("../../../web/includes/common") : Common; // eslint-disable-line no-undef

if (typeof module !== "undefined") {
    module.exports = PlayersView; // eslint-disable-line no-undef
}

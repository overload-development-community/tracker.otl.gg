//   ###                               #   #    #
//  #   #                              #   #
//  #       ###   ## #    ###    ###   #   #   ##     ###   #   #
//  #          #  # # #  #   #  #       # #     #    #   #  #   #
//  #  ##   ####  # # #  #####   ###    # #     #    #####  # # #
//  #   #  #   #  # # #  #          #   # #     #    #      # # #
//   ###    ####  #   #   ###   ####     #     ###    ###    # #
/**
 * A class that represents the games view.
 */
class GamesView {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the rendered games template.
     * @param {object[]} games The games to display.
     * @returns {string} An HTML string of the rendered games template.
     */
    static get(games) {
        return /* html */`
            ${Object.keys(games).map((s) => {
                let difference, days;

                if (games[s].countdown) {
                    difference = games[s].countdown.getTime() - new Date().getTime();
                    days = Math.floor(Math.abs(difference) / (24 * 60 * 60 * 1000));
                } else if (games[s].elapsed) {
                    difference = games[s].elapsed.getTime() - new Date().getTime();
                    days = Math.floor(Math.abs(difference) / (24 * 60 * 60 * 1000));
                }

                return /* html */`
                    <div class="server">
                        <a href="/game/${games[s].ip}">${GamesView.Common.htmlEncode(games[s].server && games[s].server.name || games[s].server && games[s].server.ip || games[s].ip || "Unknown")}</a>
                        </a>${games[s].inLobby || games[s].settings && games[s].settings.joinInProgress ? /* html */`<br />Join at ${games[s].ip} <button class="copy" data-clipboard-text="${games[s].ip}">&#x1F4CB;</button>` : ""}
                    </div>
                    <div class="time">
                        ${games[s].inLobby ? /* html */`
                            In Lobby<br />${games[s].settings.players.length}/${games[s].settings.maxPlayers} Players
                        ` : games[s].countdown ? /* html */`
                            ${days > 0 ? `${days} day${days === 1 ? "" : "s"} ` : ""}${new Date(difference).toLocaleString("en-US", {timeZone: "GMT", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23"})}
                        ` : games[s].elapsed || games[s].elapsed === 0 ? /* html */`
                            ${days > 0 ? `${days} day${days === 1 ? "" : "s"} ` : ""}${new Date(difference).toLocaleString("en-US", {timeZone: "GMT", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23"})}
                        ` : ""}
                    </div>
                    <div class="map">
                        ${games[s].settings ? /* html */`
                            ${GamesView.Common.htmlEncode(games[s].settings.matchMode)}${games[s].settings.level && ` - ${GamesView.Common.htmlEncode(games[s].settings.level)}` || ""}
                        ` : ""}
                    </div>
                    <div class="condition">
                        ${games[s].settings && games[s].settings.condition ? /* html */`
                            ${games[s].settings.condition}
                        ` : ""}
                    </div>
                    <div class="scores">
                        ${games[s].data && games[s].data.teamScore && Object.keys(games[s].data.teamScore).length > 0 && Object.keys(games[s].data.teamScore).sort((a, b) => games[s].data.teamScore[b] - games[s].data.teamScore[a]).slice(0, 4).map((team) => /* html */`
                            ${GamesView.Common.htmlEncode(team)} ${games[s].data.teamScore[team]}
                        `.trim()).join(", ") || games[s].data && games[s].data.players && games[s].data.players.length > 0 && games[s].data.players.sort((a, b) => b.kills * (games[s].data.players.length > 2 ? 3 : 1) + b.assists - (a.kills * (games[s].data.players.length > 2 ? 3 : 1) + a.assists)).slice(0, 4).map((player) => /* html */`
                            ${GamesView.Common.htmlEncode(player.name)} ${player.kills * (games[s].data.players.length > 2 ? 3 : 1) + player.assists}
                        `.trim()).join(", ") || ""}${games[s].data && games[s].data.teamScore && games[s].data.teamScore.length > 4 || games[s].data && (!games[s].data.teamScore || games[s].data.teamScore.length === 0) && games[s].data.players && games[s].data.players.length > 4 ? ", ..." : ""}
                    </div>
                `;
            }).join("")}
        `;
    }
}

// @ts-ignore
GamesView.Common = typeof Common === "undefined" ? require("../../../web/includes/common") : Common; // eslint-disable-line no-undef

if (typeof module !== "undefined") {
    module.exports = GamesView; // eslint-disable-line no-undef
}

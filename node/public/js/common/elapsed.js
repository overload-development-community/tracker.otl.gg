//  #####   ##                                    #
//  #        #                                    #
//  #        #     ###   # ##    ###    ###    ## #
//  ####     #        #  ##  #  #      #   #  #  ##
//  #        #     ####  ##  #   ###   #####  #   #
//  #        #    #   #  # ##       #  #      #  ##
//  #####   ###    ####  #      ####    ###    ## #
//                       #
//                       #
/**
 * A class that represents an elapsed timer.
 */
class Elapsed {
    //                           #                       #
    //                           #                       #
    //  ##    ##   ###    ###   ###   ###   #  #   ##   ###    ##   ###
    // #     #  #  #  #  ##      #    #  #  #  #  #      #    #  #  #  #
    // #     #  #  #  #    ##    #    #     #  #  #      #    #  #  #
    //  ##    ##   #  #  ###      ##  #      ###   ##     ##   ##   #
    /**
     * Creates a new elapsed timer instance.
     * @param {number} elapsed The amount of time elapsed, in milliseconds.
     * @param {Element} [el] The element to write to.
     */
    constructor(elapsed, el) {
        this.start = new Date(new Date().getTime() - elapsed);
        this.id = ++Elapsed.id;

        if (el) {
            el.innerHTML = `<span id="elapsed-${this.id}"></span>`;
        } else {
            document.write(`<span id="elapsed-${this.id}"></span>`);
        }

        this.update();
    }

    //                #         #
    //                #         #
    // #  #  ###    ###   ###  ###    ##
    // #  #  #  #  #  #  #  #   #    # ##
    // #  #  #  #  #  #  # ##   #    ##
    //  ###  ###    ###   # #    ##   ##
    //       #
    /**
     * Updates the timer.
     * @returns {void}
     */
    update() {
        const elapsed = document.getElementById(`elapsed-${this.id}`);

        if (!elapsed) {
            return;
        }

        const difference = new Date().getTime() - this.start.getTime(),
            days = Math.floor(Math.abs(difference) / (24 * 60 * 60 * 1000));

        elapsed.innerText = `${days > 0 ? `${days} day${days === 1 ? "" : "s"} ` : ""}${new Date(difference).toLocaleString("en-US", {timeZone: "GMT", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23"})}`;

        if (Elapsed.Time.live) {
            setTimeout(() => {
                this.update();
            }, 1001 - difference % 1000);
        }
    }
}

Elapsed.id = 0;

/** @type {typeof import("./time")} */
// @ts-ignore
Elapsed.Time = typeof Time === "undefined" ? require("./time") : Time; // eslint-disable-line no-undef

if (typeof module === "undefined") {
    window.Elapsed = Elapsed;
} else {
    module.exports = Elapsed; // eslint-disable-line no-undef
}

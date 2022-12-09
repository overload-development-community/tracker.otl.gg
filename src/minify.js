/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const csso = require("csso"),
    fs = require("fs").promises,
    path = require("path"),
    terser = require("terser"),

    Cache = require("@roncli/node-redis").Cache,
    Log = require("./logging/log"),
    settings = require("../settings");

const nameCache = {};

//  #   #    #             #      ##
//  #   #                        #  #
//  ## ##   ##    # ##    ##     #     #   #
//  # # #    #    ##  #    #    ####   #   #
//  #   #    #    #   #    #     #     #  ##
//  #   #    #    #   #    #     #      ## #
//  #   #   ###   #   #   ###    #         #
//                                     #   #
//                                      ###
/**
* Minifies and combines the specified files.
*/
class Minify {
    //                     #  #                 #  ##
    //                     #  #                 #   #
    //  ##    ###    ###   ####   ###  ###    ###   #     ##   ###
    // #     ##     ##     #  #  #  #  #  #  #  #   #    # ##  #  #
    // #       ##     ##   #  #  # ##  #  #  #  #   #    ##    #
    //  ##   ###    ###    #  #   # #  #  #   ###  ###    ##   #
    /**
     * The Express handler to return the minified version of the CSS file passed.
     * @param {Express.Request} req The request.
     * @param {Express.Response} res The response.
     * @param {function} next The next function.
     * @returns {Promise<void>} A promise that resolves when the handler has been run.
     */
    static async cssHandler(req, res, next) {
        if (!req.query.files || req.query.files === "") {
            return next();
        }

        const key = `${settings.redisPrefix}:minify:${req.query.files}`;

        let cache;
        if (!settings.disableRedis && settings.minify.cache) {
            cache = await Cache.get(key);

            if (cache) {
                res.status(200).send(cache);
                return void 0;
            }
        }

        const files = /** @type {string} */(req.query.files).split(","); // eslint-disable-line no-extra-parens

        try {
            let str = "";

            try {
                for (const file of files) {
                    const dir = path.join(__dirname, "..", "public"),
                        filePath = path.join(__dirname, "..", "public", file);

                    if (!filePath.startsWith(dir)) {
                        return next();
                    }

                    str = `${str}${await fs.readFile(filePath, "utf8")}`;
                }
            } catch (err) {
                if (err.code === "ENOENT") {
                    return next();
                }

                return next(err);
            }

            const output = csso.minify(str);

            if (!settings.disableRedis && settings.minify.cache) {
                await Cache.add(key, output.css, new Date(new Date().getTime() + 86400000));
            }

            res.status(200).type(".css").send(output.css);
            return void 0;
        } catch (err) {
            return next(err);
        }
    }

    //   #          #  #                 #  ##
    //              #  #                 #   #
    //   #    ###   ####   ###  ###    ###   #     ##   ###
    //   #   ##     #  #  #  #  #  #  #  #   #    # ##  #  #
    //   #     ##   #  #  # ##  #  #  #  #   #    ##    #
    // # #   ###    #  #   # #  #  #   ###  ###    ##   #
    //  #
    /**
     * The Express handler to return the minified version of the JavaScript file passed.
     * @param {Express.Request} req The request.
     * @param {Express.Response} res The response.
     * @param {function} next The next function.
     * @returns {Promise<void>} A promise that resolves when the handler has been run.
     */
    static async jsHandler(req, res, next) {
        if (!req.query.files || req.query.files === "") {
            return next();
        }

        const key = `${settings.redisPrefix}:minify:${req.query.files}`;

        let cache;
        if (!settings.disableRedis && settings.minify.cache) {
            cache = await Cache.get(key);

            if (cache) {
                res.status(200).send(cache);
                return void 0;
            }
        }

        const files = /** @type {string} */(req.query.files).split(","); // eslint-disable-line no-extra-parens

        try {
            /** @type {Object<string, string>} */
            let code;

            try {
                code = await files.reduce(async (prev, cur) => {
                    const obj = await prev;

                    let filePath;

                    switch (cur) {
                        case "/js/common/timeago.min.js":
                            filePath = path.join(__dirname, "..", "node_modules/timeago.js/dist/timeago.min.js");
                            break;
                        case "/js/common/clipboard.min.js":
                            filePath = path.join(__dirname, "..", "node_modules/clipboard/dist/clipboard.min.js");
                            break;
                        case "/js/common/chart.js":
                            filePath = path.join(__dirname, "..", "node_modules/chart.js/dist/chart.umd.js");
                            break;
                        default: {
                            const dir = path.join(__dirname, "..", "public");

                            filePath = path.join(dir, cur);
                            if (!filePath.startsWith(dir)) {
                                return next();
                            }
                        }
                    }

                    obj[cur] = await fs.readFile(filePath, "utf8");

                    return obj;
                }, Promise.resolve({}));
            } catch (err) {
                if (err.code === "ENOENT") {
                    return next();
                }

                return next(err);
            }

            const output = await terser.minify(code, {nameCache});

            if (!output.code) {
                const err = new Error("A terser error occurred.");

                Log.exception("A terser error occurred.", err);
                next(err);
                return void 0;
            }

            if (!settings.disableRedis && settings.minify.cache) {
                await Cache.add(key, output.code, new Date(new Date().getTime() + 86400000));
            }

            res.status(200).type(".js").send(output.code);
            return void 0;
        } catch (err) {
            return next(err);
        }
    }

    //                   #      #
    //                   #
    //  ##    ##   # #   ###   ##    ###    ##
    // #     #  #  ####  #  #   #    #  #  # ##
    // #     #  #  #  #  #  #   #    #  #  ##
    //  ##    ##   #  #  ###   ###   #  #   ##
    /**
     * Combines the specified filenames into a single filename.
     * @param {string[]} files The list of filenames to combine.
     * @param {"js" | "css"} type The file type to combine.
     * @returns {string} The combined filename.
     */
    static combine(files, type) {
        if (settings.minify.enabled) {
            switch (type) {
                case "js":
                    return `<script src="/js/?files=${files.join(",")}"></script>`;
                case "css":
                    return `<link rel="stylesheet" href="/css/?files=${files.join(",")}" />`;
                default:
                    return "";
            }
        } else {
            switch (type) {
                case "js":
                    return files.map((f) => `<script src="${f}"></script>`).join("");
                case "css":
                    return files.map((f) => `<link rel="stylesheet" href="${f}" />`).join("");
                default:
                    return "";
            }
        }
    }
}

module.exports = Minify;

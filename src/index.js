/**
 * @author Silent-Coder
 * @license ICS
 * @copyright Silent-Coder
 * @file index.js
 */

'use-strict';
const db = require("mongoose");
const cs = require("./models/currency");
/**
 * @class CurrencySystem
 */
class WordGame {
    constructor(db) {
        if (db == "mongodb") return require("./MongoDB/index");
        else if (db == "quickdb") return require("./QuickDB/index");
        else throw new Error("Not a valid Database! Either use 'quickdb' or 'mongodb'.")
    }
};


module.exports = {
    WordGame,
    connect
};

function connect(password) {
    if (!password.startsWith("mongodb+srv")) throw new TypeError("Invalid MongoURL");
    let connected = true;
    db.connect(password, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).catch(e => {
        connected = false;
        throw new TypeError(`${e}`);
    }).then(() => {
        if (connected === true) console.info("Connected to DB successfully.")
    });
};
async function findUser(settings) {
    let find = await cs.findOne({
        userID: settings.user.id,
        guildID: settings.guild.id || false
    });
    return find;
};
async function makeUser(settings, user2 = false) {
    let user = settings.user.id
    if (user2) user = settings.user2.id;
    const newUser = new cs({
        userID: user,
        guildID: settings.guild.id || false,
        wallet: 100,
        bank: 1000,
        inventory: "nothing",
        lastUpdated: new Date(),
        lastGamble: 0,
        lastWork: 0,
        lastRob: 0
    });
    await newUser.save().catch(console.error);
    return newUser;
};
async function saveUser(data) {
    await data.save().catch(e => {
        throw new TypeError(`${e}`);
    });
};
// This is for Rob Command
function testChance(successPercentage) {
    let random2 = Math.random() * 10;
    return ((random2 -= successPercentage) < 0);
}
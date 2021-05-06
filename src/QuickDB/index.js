module.exports = async (client) => {
    let wrongEmoji = "806102736352444426";
    let rightEmoji = "834031956551139358";
    let SameWord2TimeEmoji = "834030997649358869";
    let noneEglishReactEmoji = "834031066674495499";

    client.on("message", async (message) => {
        await client.users.cache.get(message.author.id);
        if (message.author.bot) return
        //Checks if its a word game channel

        if (message.content.toLowerCase() === "!!start") {
            if (!message.member.hasPermission("ADMINISTRATOR") && !client.config.owners.includes(message.author.id))
                return message.channel.send({
                    embed: {
                        color: 'RED',
                        description: `You Don't Have Permission To Use This Command!`
                    }
                });
            message.channel.send({
                embed: {
                    title: "Game Started",
                    color: "GREEN",
                    description: "I'll start first!"
                }
            });
            let newword = await require("node-fetch")("http://random-word-api.herokuapp.com/word?number=1&swear=0").then(r => {
                return r.json();
            });

            client.wordGame.guilds.push({
                "guildID": message.guild.id,
                "lastUserID": "123",
                "lastWord": newword[0],
                "allWords": []
            });
            message.channel.send(newword[0])
            client.wordGame.channels.push(message.channel.id);
            await require("node-fetch")("https://bedrockblunder.ml/UltraX/db/wordgame/addChannel.php?channel=" + message.channel.id + "&guildID=" + message.guild.id + "&word=" + newword[0])
            return;
        };
        if (message.content.toLowerCase() === "!!reroll") {
            if (!message.member.hasPermission("ADMINISTRATOR") && !message.member.hasPermission("MANAGE_MESSAGES") && !client.config.owners.includes(message.author.id))
                return message.channel.send({
                    embed: {
                        color: 'RED',
                        description: `You Don't Have Permission To Use This Command!`
                    }
                })
            await client.findword(client.getDB(message.guild.id).lastWord.slice(-1), message.guild.id, message)
            return;
        };
        if (message.content.toLowerCase() === "!!stop") {
            if (!message.member.hasPermission("ADMINISTRATOR") && !client.config.owners.includes(message.author.id))
                return message.channel.send({
                    embed: {
                        color: 'RED',
                        description: `You Don't Have Permission To Use This Command!`
                    }
                })
            message.channel.send({
                embed: {
                    title: "Dm Be Intelligent to remove it from DB.",
                    color: "GREEN",
                }
            });
            //   for (var i = 0; i < client.wordGame.channels.length; i++) {
            //       if (client.wordGame.channels[i] === message.channel.id) {
            //           client.wordGame.channels.splice(i, 1);
            //           i--;
            //      }
            // }
            //   await require("node-fetch")("https://bedrockblunder.ml/UltraX/db/wordgame/remChannel.php?guildID=" + message.guild.id)
        }
        // if message start with white listed word, return;
        if (!client.wordGame.channels.includes(message.channel.id)) return;
        if (message.content.toLowerCase() === "cw" || message.content.toLowerCase() === "currentword" || message.content.toLowerCase() === "cl") return message.channel.send("Current word is **" + client.getDB(message.guild.id).lastWord + "**");
        if ((message.content).split(' ').map(i => i.charAt(0))[0].match(/[^a-zA-Z]+/g)) return;

        // IF same users says a word delete it and ask him to pls no and than delete that message
        if (message.author.id == parseInt(client.getDB(message.guild.id).lastUserID)) {
            message.channel.send(message.author, {
                embed: {
                    title: "Please give others a chance as well!",
                    color: "RED"
                }
            }).then(m => m.delete({
                timeout: 5000
            }));
            return;
        };
        // if last word and new words are same , react 806102736352444426
        if ((client.getDB(message.guild.id).lastWord).toLowerCase() === (message.content).toLowerCase()) {
            message.react(wrongEmoji);
            return;
        };
        // if its 1 letter word, return;
        if ((message.content).length < 2) {
            message.react(wrongEmoji);
            return;
        };

        if ((client.getDB(message.guild.id).lastWord).slice(-1) != (message.content.toLowerCase()).split(' ').map(i => i.charAt(0))[0]) {
            message.react(wrongEmoji);
            return;
        }

        if (client.getDB(message.guild.id).allWords.includes(message.content.toLowerCase())) {
            message.react(SameWord2TimeEmoji);
            return;
        };
        let EngCheck = await require("node-fetch")("https://api.dictionaryapi.dev/api/v2/entries/en/" + encodeURI(message.content.toLowerCase())).then(r => {
            return r.json();
        });
        if (EngCheck.title) {
            message.react(noneEglishReactEmoji);
            return;
        };
        client.getDB(message.guild.id).lastWord = (message.content).toLowerCase();
        client.getDB(message.guild.id).allWords.push((message.content).toLowerCase());
        client.getDB(message.guild.id).lastUserID = message.author.id;

        message.react(rightEmoji)
        await require("node-fetch")("https://bedrockblunder.ml/UltraX/db/wordgame/addPointToUser.php?id=" + message.author.id + "&guildID=" + message.guild.id);
        await require("node-fetch")("https://bedrockblunder.ml/UltraX/db/wordgame/addWords.php?id=" + message.author.id + "&word=" + encodeURI((message.content).toLowerCase()) + "&guildID=" + message.guild.id)
    });
    client.on("ready", async () => {
        client.wordGame = {};
        let data = await require("node-fetch")("https://bedrockblunder.ml/UltraX/db/wordgame/getAlldata.php").then(r => {
            return r.json();
        });
        client.wordGame = data;
        client.getDB = (guildID) => {
            let i;
            client.wordGame.guilds.forEach(function (x) {
                if (x.guildID == guildID) i = x;
            });
            return i;
        };
        client.findword = async (word, guildID, message) => {
            let data = await require("node-fetch")("https://api.datamuse.com/words?sp=" + word + "*").then(r => {
                return r.json();
            });
            const GetDB = (guildID) => {
                let i;
                client.wordGame.guilds.forEach(function (x) {
                    if (x.guildID == guildID) i = x;
                });
                return i;
            };
            let i = [];
            data.forEach(function (x) {
                i.push(x.word);
            });
            i = i.filter(function (val) {
                return GetDB(guildID).allWords.indexOf(val) == -1;
            });
            let rword = i[Math.floor(Math.random() * i.length)];
            if (rword == undefined) {
                message.channel.send({
                    embed: {
                        title: "You guys kindda suck at getting words that start with '" + word + "'",
                        color: "YELLOW",
                        description: "I'll reroll the word for you!"
                    }
                });
                let newword = await require("node-fetch")("http://random-word-api.herokuapp.com/word?number=1&swear=0").then(r => {
                    return r.json();
                });
                GetDB(guildID).lastWord = newword[0];
                GetDB(guildID).lastUserID = "1234";
                message.channel.send(newword[0])
                await require("node-fetch")("https://bedrockblunder.ml/UltraX/db/wordgame/addWords.php?id=123&word=" + newword[0] + "&guildID=" + message.guild.id);
                return;
            } else return message.channel.send(rword);
        };
    });
};
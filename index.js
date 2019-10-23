// INIT
// https://discordapp.com/oauth2/authorize?client_id=YOUR_CLIENT_ID_HERE&scope=bot&permissions=0
const Discord = require("discord.js");
const bot = new Discord.Client();

// PACKAGES
const fs = require("fs");
const ytdl = require("ytdl-core");
const fetchVideoInfo = require("youtube-info");
const fetch = require("node-fetch");

// SETTINGS
const config = JSON.parse(fs.readFileSync("./settings.json", "utf-8"));
const token = config.token;
const prefix = config.prefix;
const yt_api_key = config.yt_api_key;
const tenor_api_key = config.tenor_api_key;
const tenor_anon_id = config.tenor_anon_id;
const myID = config.myID;
const pawelID = config.pawelID;
var playlistData = JSON.parse(fs.readFileSync("./playlist-data.json", "utf-8"));

// VARIABLES
const youtubeRegex = /^https?:\/\/(www\.youtube\.com\/watch\?v\=|y2u\.be\/|youtu\.be\/)[a-zA-Z0-9-_]{11}.*$/;
const playlistRegex = /^https?:\/\/www\.youtube\.com\/playlist\?list\=[a-zA-Z0-9-_]{34}.*$/;
const answers = [
    "Still dead :dizzy_face:",
    "Sorry to inform, but he's still dead :cry:",
    "Nothing's changed, he's dead :confounded:",
    "Dead :skull:",
    "The greatest leader of all the times is dead :sob:",
    "Still dead ... But AM I dead??? :thinking:",

    "Martwy :sob:",
    "Dead :sob:",
    "Tot :sob:",
    "Mortuus :sob:",
    "Dood :sob:",
    "মৃত :sob:",
    "Smrt :sob:",
    "死 :sob:",
    "Mrtví :sob:",
    "Død :sob:",
    "Mortintoj :sob:",
    "Kuollut :sob:",
    "Mort :sob:",
    "Νεκρός :sob:",
    "Ua make :sob:",
    "Halott :sob:",
    "デッド :sob:",
    "Мртви :sob:",
    "مرده :sob:",
    "Мертвий :sob:"
];
const customEmojis = [
    { name: ":crusader_pepe:", emojiName: "<:crusader_pepe:469916289218117632>", fileName: "crusader_pepe.png" , regex: /\<:crusader_pepe:469916289218117632\>/ },
    { name: ":ok_hand_crusader:", emojiName: "<:ok_hand_crusader:469917135695773706>", fileName: "ok_hand_crusader.png", regex: /\<:ok_hand_crusader:469916289218117632\>/ },
    { name: ":slodka_rosija:", emojiName: "<:slodka_rosija:330724436258848769>", fileName: "slodka_rosija.png", regex: /\<:slodka_rosija:469916289218117632\>/},
	{ name: ":celest_vult:", emojiName: "<:celest_vult:481818536600272896>", fileName: "celest_vult.png", regex: /\<:celest_vult:469916289218117632\>/},
	{ name: ":deus_kek:", emojiName: "<:deus_kek:515546467231072257>", fileName: "deus_kek.png", regex: /\<:deus_kek:515546467231072257\>/},
	{ name: "battle_pepe", emojiName: "<:battle_pepe:515547465823289354>", fileName: "battle_pepe.png", regex: /\<:battle_pepe:515547465823289354\>/},
	{ name: ":thonk:", emojiName: "<:thonk:522165986095398913>", fileName: "thonk.jpg", regex: /\<:thonk:522165986095398913\>/},
	{ name: ":bob:", emojiName: "<:bob:588505387716837392>", fileName: "bob.png", regex: /\<:bob:588505387716837392\>/ }
];
const emojis = {
	"arrow_left": "⬅",
	"arrow_right": "➡",
	"stop_sign": "🚫"
};
const digits = [
	"0⃣",
	"1⃣",
	"2⃣",
	"3⃣",
	"4⃣",
	"5⃣",
	"6⃣",
	"7⃣",
	"8⃣",
	"9⃣"
];
var servers = {};

// CORE
bot.on("ready", () => {
    bot.user.setActivity("The world become a better place to live in", {type: "Watching"});
    const guildList = bot.guilds.array();
    for (var i = 0; i < guildList.length; i++) {
        servers[guildList[i].id] = {
            queue: [],
            loopedSingle: false,
            loopedAll: false,
			isQueueUp: false
        };
    }
	if (!playlistData.users) {
		playlistData.users = {};
		savePlaylistData();
	}
	if (!playlistData.public) {
		playlistData.public = {};
		savePlaylistData();
	}
	console.log("░░░░░░░░░░▀▀▀██████▄▄▄░░░░░░░░░░\n░░░░░░░░░░░░░░░░░▀▀▀████▄░░░░░░░\n░░░░░░░░░░▄███████▀░░░▀███▄░░░░░\n░░░░░░░░▄███████▀░░░░░░░▀███▄░░░\n░░░░░░▄████████░░░░░░░░░░░███▄░░\n░░░░░██████████▄░░░░░░░░░░░███▌░\n░░░░░▀█████▀░▀███▄░░░░░░░░░▐███░\n░░░░░░░▀█▀░░░░░▀███▄░░░░░░░▐███░\n░░░░░░░░░░░░░░░░░▀███▄░░░░░███▌░\n░░░░▄██▄░░░░░░░░░░░▀███▄░░▐███░░\n░░▄██████▄░░░░░░░░░░░▀███▄███░░░\n░█████▀▀████▄▄░░░░░░░░▄█████░░░░\n░████▀░░░▀▀█████▄▄▄▄█████████▄░░\n░░▀▀░░░░░░░░░▀▀██████▀▀░░░▀▀██░░")
});

bot.on("message", (message) => {
    try {
		if(message.author.id === bot.user.id || message.guild === null)
			return;

	    const messageParts = message.content.trim().split(/\s+/);
	    const parameters = messageParts.splice(1, messageParts.length);
	    const server = servers[message.guild.id];
	    switch (messageParts[0]) {
	        case prefix + "play":
	            if (!message.member.voiceChannel) {
	                message.channel.send("You must be in a voice channel");
	                break;
	            } else if (!parameters[0]) {
					message.channel.send("You must provide an argument: `!play { name|link }`");
	                break;
				}
	            if (playlistRegex.test(parameters[0])) {
	                addYtPlaylistToQueue(parameters[0], message, parameters[1] == "-shuffle" ? true : false);
	            } else {
	                searchForYtItem(parameters.join(" "), false, message);
	            }
	            break;
        	case prefix + "fplay":
	            if (!message.member.voiceChannel) {
	                message.channel.send("You must be in a voice channel");
	                break;
	            } else if (!parameters[0]) {
	                message.channel.send("You must provide an argument: `!fplay { name|link }`");
	                break;
	            } else if (playlistRegex.test(parameters[0])) {
	                message.channel.send("O no no no no no, I ain't f-playin' a whole playlist");
	                break;
	            } else if (server.loopedSingle || server.loopedAll) {
	                message.channel.send("I won't play that as long as other songs are being looped, buhahahahha");
	                break;
				}
	            searchForYtItem(parameters.join(" "), (server.queue[1] ? true : false), message);
	            break;
			case prefix + "skip":
	            if (!server.queue[0]) {
	                message.channel.send("There must be a song in your queue");
	                break;
	            }
	            var amount = 1;
	            if (parameters[0]) {
	                if (parseInt(parameters[0], 10) !== parseInt(parameters[0]) || parameters[0] < 1 || parameters[0] > 10) {
						message.channel.send("You must provide a valid argument: { <1, 10>|?none }\nnone: I will skip one song by default");
						break;
	                } else {
	                    amount = parseInt(parameters[0]);
	                }
				}
	            for (var i = 1; i < Math.min(amount, server.queue.length - 1); i++) {
	                server.queue.shift();
	            }
	            server.dispatcher.end();
	            break;
	        case prefix + "curr":
	            if(!server.queue[0]) {
	                message.channel.send("There must be a song in your queue");
	                break;
	            }
	            message.channel.send(`Currently playing: **${server.queue[0].name}**`);
	            break;
	        case prefix + "queue":
	            if (server.queue.length < 2) {
	                message.channel.send("There are no songs in queue");
	                break;
	            } else if (server.isQueueUp == true) {
					message.channel.send("There is still one active queue in chat");
					break;
				}
				showQueue(message);
	            break;
	        case prefix + "loop":
	            if(!server.queue[0]) {
	                message.channel.send("There must be a song in your queue");
	                break;
	            }
	            if (!parameters[0]) {
	                message.channel.send("You must provide an argument: { single|all|off }");
	                break;
				}
				var quit = false;
				switch (parameters[0]) {
					case "single":
					case "all":
					case "off":
						break;
					default:
	                	message.channel.send("You must provide a valid argument: { single|all|off }");
						quit = true;
						break;
				}
				if (quit) {
					break;
				}
				switch (parameters[0]) {
					case "single":
						if (server.loopedSingle || server.loopedAll) {
							message.channel.send("Already looping");
							break;
						}
						server.server.loopedSingle = true;
						message.channel.send(`Now looping: **${server.queue[0].name}**`);
						break;
					case "all":
						if (server.loopedSingle || server.loopedAll) {
							message.channel.send("Already looping");
							break;
						}
						server.loopedAll = true;
						message.channel.send(`Now looping: **${server.queue.length}** songs`);
						break;
					case "off":
						if (!server.loopedSingle && !server.loopedAll) {
							message.channel.send("I'm not looping anything");
							break;
						}
						server.loopedSingle = server.loopedAll = false;
						message.channel.send(`Stopped looping boss!`);
						break;
				}
	            break;
	        case prefix + "volume":
	            if (!parameters[0]) {
	                message.channel.send("You must provide an argument: `!volume { <1, 200> }`");
	                break;
	            } else if (parseInt(parameters[0], 10) !== parseInt(parameters[0]) || parameters[0] < 1 || parameters[0] > 200) {
	                message.channel.send("You must provide a valid argument: { <1, 200> }");
	                break;
	            } else {
	                const vol = parseInt(parameters[0]) / 100;
	                server.dispatcher.setVolume(vol);
	                message.channel.send(`Volume changed to: **${parseInt((parseInt(parameters[0]) / 100) * 100)}**`);
	                break;
	            }
	        case prefix + "pause":
	            if(!server.queue[0]) {
	                message.channel.send("There must be a song in your queue");
	                break;
	            }
	            server.dispatcher.pause();
	            break;
	        case prefix + "resume":
	            if(!server.queue[0]) {
	                message.channel.send("There must be a song in your queue");
	                break;
	            }
	            server.dispatcher.resume();
	            break;
	        case prefix + "shuffle":
	            if(server.queue.length < 1) {
	                message.channel.send("There are too few songs in queue to shuffle");
	                return;
				}
				shuffleQueue(message,server);
				message.channel.send("Everyday I'm shufflin'");
	            break;
	        case prefix + "leave":
	            if(!server.queue[0]) {
	                message.channel.send("There must be a song in your queue");
	                break;
	            }
	            server.loopedSingle = server.loopedAll = false;
	            server.dispatcher.pause();
	            server.queue = [];
	            server.dispatcher.end();
	            break;
	        case prefix + "thumbnail":
	            if(!youtubeRegex.test(parameters[0])) {
	                message.channel.send("You must provide a valid link to a youtube video");
	                break;
	            }
	            sendThumbnail(parameters[0], message);
	            break;
	        case prefix + "vote":
	            if (!/\bvs\b/.test(message.content)) {
	                message.channel.send("Your message must look like this: `!vote { option #1 } vs { option #2 }`");
	                break;
	            }
	            vote(parameters.join(' ').split(' vs '), message);
	            break;
			case prefix + "racist-urban":
				if (!parameters[0]) {
					message.channel.send("You must provide an argument: `!racist-urban { some weird looking phrase }`");
					break;
				}
				searchUrban(parameters.join(" "), message);
				break;
			case prefix + "gif":
				if (!parameters[0]) {
					message.channel.send("You must provide an argument: `!gif { name }`");
					break;
				}
				searchTenorGif(parameters.join(" "), message);
				break;
			case prefix + "usmiesznij":
				var str = parameters.join(' ');
				if (str.length > 80) {
					message.channel.send("It looks like your message is too long (max: 80)");
					break;
				}
				str = str.toLowerCase().replace(/([a-z])/g, ":regional_indicator_$1:").replace(/ /g, ":small_blue_diamond:").replace(/\, ?/g,' ').replace(/\. ?/g, '\n');
				message.channel.send(str);
				message.delete();
				break;
			case prefix + "playlist":
				managePlaylistData(parameters, message);
				break;
        	case prefix + "help":												// NEED TO UPDATE WITH EACH CHANGE
	            var embed = new Discord.RichEmbed()
	                .setTitle("Here are some commands that might come in handy :^)")
	                .setColor((message.member.colorRole ? message.member.colorRole.hexColor : [255, 100, 255]))
	                .addField("!play { song's name | yt link }", "Plays a song of your choice given its name or link")
					.addField("!fplay { song's name | yt link }", "guess what it does")
	                .addField("!skip", "Skips up to 10 songs")
	                .addField("!curr", "Displays currently played song")
	                .addField("!queue", "Displays the queue 🤔")
	                .addField("!loop { single | all | off", "Loops or unloops the queue 🤔")
	                .addField("!volume { <1, 100> }", "Sets volume 🤔")
	                .addField("!pause", "Pauses the song 🤔")
	                .addField("!resume", "Resumes the song 🤔")
	                .addField("!shuffle", "Shuffles the queue 🤔")
	                .addField("~~!leave~~", "**DON'T YOU DARE TYPING THIS IN CHAT 😡**")
					.addField("!thumbnail { yt link }", "I send you a thumbnail of some youtube video provided its link >_>")
	                .addField("!vote { option #1 } vs { option #2 }", "Creates a poll")
					.addField("!racist-urban { phrase }","guess what it does")
					.addField("!gif { phrase }", "guess what it does")
					.addField("!usmiesznij { phrase }", "guess what it does")
					.addField("!playlist { public|private } { add|print|remove } { playlist-link|name }", "guess what it does")
	            message.channel.send(embed);
	            break;
	        case prefix + "test":
	            if(!message.author.id == myID)
					break;
				console.log(server.queue)
	            break;
			case prefix + "eval":
	            if(!message.author.id == myID)
					break;
				try {
					eval(message.content.substr((prefix + "eval ").length));
				} catch (err) {
					console.error(err)
				}
				break;
	    }
	    if(message.content.startsWith(prefix))
	        return;

	    checkForTextMessages(message);
	} catch (err) {
		message.channel.send("Oops, looks like something went wrong");
		console.error(err);
	}
});

// MUSIC FUNCTIONS HERE
async function play(connection, message) {										// basic stuff
    try {
		const server = servers[message.guild.id];
		const stream = await ytdl(`https://www.youtube.com/watch?v=${server.queue[0].id}`, { filter: "audioonly" });
		stream.on('error', err => {
			// console.log('---------------ytdl-error---------------')
			// console.error(err)
			// return
			server.queue.unshift({ type: 'filler' })
			play(connection, message)
			return
		})
		const streamOptions = {
			seek: server.queue[0].seek || 0,
			volume: 1
		};
        server.dispatcher = await connection.playStream(stream, streamOptions);
        server.dispatcher.on("end", () => {
			// console.log('server.dispatcher.end')
            if (server.loopedSingle == true) {
                server.queue.unshift(server.queue.shift());
            } else if (server.loopedAll == true) {
                server.queue.push(server.queue.shift());
			} else {
				server.queue.shift();
			}
            if (server.queue[0]) {
                play(connection, message);
            } else {
                connection.disconnect();
                server.loopedSingle = server.loopedAll = false;
            }
		});
    } catch (err) {
        message.channel.send("Uh, oh, something went wrong :/");
        console.error(err);
    }
}

async function startPlaying(message) {											// ----||----
    try {
        if (!message.guild.voiceConnection) {
            var connection = await message.member.voiceChannel.join();
            play(connection, message);
        }
    } catch (err) {
        message.channel.send("Uh, oh, something went wrong :/");
        console.error(err);
    }
}

async function searchForYtItem(str, forced, message) {							// !play single song
    try {
        var id = null;
		if (youtubeRegex.test(str)) {
			var arr = /t=(\d+)s?/.exec(str);
			const time = arr ? arr[1] : null;
			arr = /[\/=]([a-zA-Z0-9-_]{11})/.exec(str);
			const id = arr ? arr[1] : null;
			if (id === null || id === undefined) {
				return;
			}
			addYtItemToQueue(id, forced, time, message);
		} else {
			const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=id&type=video&q=${encodeURIComponent(str)}&key=${yt_api_key}`);
	        const json = await response.json();
			const items = json.items;
			var videos = [];
			for (var i = 0; i < items.length; i++) {
				var curr = await fetchVideoInfo(items[i].id.videoId);
				videos.push(await {
					id: curr.videoId,
					name: curr.title,
					channel: curr.owner,
					time: curr.duration
				});
			}
			const embed = new Discord.RichEmbed()
				.setTitle("Select the song of your choice")
				.setColor((message.member.colorRole ? message.member.colorRole.hexColor : [255, 100, 255]))
			for (var i = 0; i < videos.length; i++) {
				embed.addField("**" + (i + 1) + ".**", "**" + videos[i].name + "** [" + convertTime(videos[i].time) + "] \nBy: " + videos[i].channel);
			}
			const sentEmbed = await message.channel.send(embed);
			for (var i = 1; i <= videos.length; i++) {
				await sentEmbed.react(digits[i]);
			}
			const filter = (reaction, user) => user.id != bot.user.id && (reaction.emoji.name == digits[1] || reaction.emoji.name == digits[2] || reaction.emoji.name == digits[3] || reaction.emoji.name == digits[4] || reaction.emoji.name == digits[5])
			const collector = await sentEmbed.createReactionCollector(filter, { time: 10000 });
			collector.on("collect", reaction => {
				switch (reaction.emoji.name) {
					case digits[1]:
						id = videos[0].id;
						break;
					case digits[2]:
						id = videos[1].id;
						break;
					case digits[3]:
						id = videos[2].id;
						break;
					case digits[4]:
						id = videos[3].id;
						break;
					case digits[5]:
						id = videos[4].id;
						break;
				}
				addYtItemToQueue(id, forced, null, message);
				sentEmbed.delete();
			});
			collector.on("end", () => {
				if (id == null) {
					addYtItemToQueue(videos[0].id, forced, null, message);
					sentEmbed.delete();
				}
			});
		}
    } catch (err) {
        message.channel.send("Uh, oh, something went wrong :/");
        console.error(err);
    }
}

async function addYtItemToQueue(id, forced, seek, message) {					// -------||-------
	try {
		const server = servers[message.guild.id];
		const info = await fetchVideoInfo(id);
        if (forced === true) {
            // await server.dispatcher.pause();
            server.queue = await [server.queue[0]].concat([{
                id: info.videoId,
                name: info.title + " [" + convertTime(info.duration) + "]"
            }]).concat(server.queue.slice(1));
			// await server.dispatcher.end();
			if (seek) {
				server.queue[1].seek = seek;
			}
            await message.channel.send("You forced me to play: **" + server.queue[1].name + "**, you, you *MONSTER*" + (seek ? "\nIt will start at: " + convertTime(seek) : ""));
        } else {
            await server.queue.push({
                id: info.videoId,
                name: info.title + " [" + convertTime(info.duration) + "]"
            });
			if (seek) {
				server.queue[server.queue.length - 1].seek = seek;
			}
            await message.channel.send("Added to queue: **" + server.queue[server.queue.length - 1].name + "**" + (seek ? "\nIt will start at: " + convertTime(seek) : ""));
        }
        startPlaying(message);
	} catch (err) {
		console.error(err);
	}
}

async function addYtPlaylistToQueue(str, message, shuffle = false) {			// !play a playlist
    try {
        const server = await servers[message.guild.id];
        const pos = str.indexOf("list=");
        if(pos < 0) {
            message.channel.send("You must provide a valid link to a youtube playlist");
            return;
        }
        const playlistId = str.substr(pos + 5, pos + 39);
        var response = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${yt_api_key}`);
        var json = await response.json();
        if(json.error) {
            message.channel.send("Oops, something went wrong. Please make sure that the playlist isn't private");
            return;
        }

        var videos = [];
        videos = await addPlaylistVideos(json, videos);
        while(json.nextPageToken) {
            response = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${yt_api_key}&pageToken=${json.nextPageToken}`);
            json = await response.json();
            videos = await addPlaylistVideos(json, videos);
        }

        for(var i = 0; i < videos.length; i++) {
            await server.queue.push({
                id: videos[i].id,
                name: videos[i].name
            });
        }
		await message.channel.send(`Added: **${videos.length}** songs to queue`);
		if (shuffle) {
			await shuffleQueue(message, server);
		}
        startPlaying(message);
    } catch (err) {
        message.channel.send("Uh, oh, something went wrong :/");
        console.error(err);
    }
}

async function addPlaylistVideos(json, videos) {								// -------||-------
    try {
        for(var i = 0; i < json.items.length; i++) {
            if(json.items[i].snippet.title.toLowerCase() != "deleted video" && json.items[i].snippet.title.toLowerCase() != "private video") {
                await videos.push({
                    id: json.items[i].snippet.resourceId.videoId,
                    name: json.items[i].snippet.title
                });
            }
        }
        return videos;
    } catch (err) {
        console.error(err);
    }
}

async function showQueue(message) {												// !queue
	try {
		const server = servers[message.guild.id];
		const maxPos = 10;
		var page = 0;
		server.isQueueUp = true;
		var newEmbed = await getQueuePage(page, maxPos, message);
		var sentEmbed = await message.channel.send(newEmbed);
		if (server.queue.length <= 10) {
			sentEmbed.react(emojis["stop_sign"]);
			server.isQueueUp = false;
			return;
		}
		if (page > 0) {
			sentEmbed.react(emojis["arrow_left"]);
		}
		if ((page + 1) * maxPos < server.queue.length - 1) {
			sentEmbed.react(emojis["arrow_right"]);
		}
		const filter = (reaction, user) => user.id !== bot.user.id && (reaction.emoji.name == emojis["arrow_left"] || reaction.emoji.name == emojis["arrow_right"])
		const collector = sentEmbed.createReactionCollector(filter, { time: 20000 });
		collector.on("collect", async reaction => {
			sentEmbed.clearReactions();
			if (reaction.emoji.name == emojis["arrow_left"]) {
				page--;
				var newEmbed = await getQueuePage(page, maxPos, message);
				sentEmbed = await sentEmbed.edit(newEmbed);
			} else if (reaction.emoji.name == emojis["arrow_right"]) {
				page++;
				var newEmbed = await getQueuePage(page, maxPos, message);
				sentEmbed = await sentEmbed.edit(newEmbed);
			}
			if (page > 0) {
				await sentEmbed.react(emojis["arrow_left"]);
			}
			if ((page + 1) * maxPos < server.queue.length - 1) {
				await sentEmbed.react(emojis["arrow_right"]);
			}
		});
		collector.on("end", collected => {
			sentEmbed.clearReactions();
			sentEmbed.react(emojis["stop_sign"]);
			server.isQueueUp = false;
		});
	} catch (err) {
		message.channel.send("Uh, oh, something went wrong");
		console.error(err);
	}
}

async function getQueuePage(page, maxPos, message) {							// --||--
	try {
		const server = servers[message.guild.id];
		var embed = new Discord.RichEmbed()
			.setTitle("Here are the songs on positions: " + (page * maxPos + 1) + " - " + Math.min((page + 1) * maxPos, server.queue.length - 1) + "\nTotal queue size - " + (server.queue.length - 1))
			.setColor((message.member.colorRole ? message.member.colorRole.hexColor : [255, 100, 255]))
			.setFooter("Each queue will be available for 30 sec since it's been called, afther half a minute it'll be blocked and you'll be able to use \'!queue\' again")
		for (var i = (page * maxPos + 1); i <= Math.min((page + 1) * maxPos, server.queue.length - 1); i++) {
			embed.addField(i + ". ", server.queue[i].name);
		}
		return embed;
	} catch (err) {
		console.error(error);
	}
}

// OTHER FUNCTIONS HERE
function convertTime(sec) {
    try {
        sec = parseInt(sec, 10);
        var hours = Math.floor(sec / 3600);
        var minutes = Math.floor((sec / 60) % 60);
        var seconds = sec % 60;
        if(hours != "0" && minutes < 10)
            minutes = "0" + minutes;
        if(seconds < 10)
            seconds = "0" + seconds;
        return (hours != "0" ? (hours + ":") : "") + minutes + ":" + seconds;
    } catch (err) {
        console.error(err);
    }
}

async function checkForTextMessages(message) {
    try {
        customEmojis.forEach( async (el, index) => {
            if (message.content == el.emojiName || message.content == el.name) {
                const deletedMessage = await message.delete();
                await deletedMessage.channel.send(new Discord.Attachment("./emojis/" + el.fileName, el.fileName));
            }
        });
        if (/(deus vult|DEUS VULT|Deus Vult)/.test(message.content)) {
            await message.react("🇩");
            await message.react("🇪");
            await message.react("🇺");
            await message.react("🇸");
            await message.react(bot.emojis.get("469916289218117632"));
            await message.react("🇻");
            await message.react(bot.emojis.get("470171069823713281"));
            await message.react("🇱");
            await message.react("🇹");
        }
        if (/(komunizm|Komunizm)/.test(message.content) && message.member.id == pawelID) {
            message.channel.send("**TRIGGERED** :angry:");
		}
		if (message.content == '🤔') {
			message.react('🤔');
		}
        if (/<_+</.test(message.content)) {
			message.channel.send(`>${/<(_+)</.exec(message.content)[1]}>`);
        }
        if (/>_+>/.test(message.content)) {
            message.channel.send(`<${/>(_+)>/.exec(message.content)[1]}<`);
        }
        if (/ku chwale|Ku chwale/.test(message.content)) {
            message.channel.send("Ku chwale Wielkiej Rosji! <:slodka_rosija:330724436258848769>");
        }
        if (/ping|Ping/.test(message.content)) {
            message.channel.send("Pong! :ping_pong:");
        }
        if (/pong|Pong/.test(message.content)) {
            message.channel.send("Ping! :ping_pong:");
        }
        if (message.content.toLowerCase() == "how is stalin?") {
            message.channel.send(answers[Math.floor(Math.random() * answers.length)]);
        }
        if (message.content.toLowerCase() == "what's stalin thinking?") {
            message.channel.send((Math.random() < 0.5) ? "Yes :thumbsup::skin-tone-1:" : "No :thumbsdown::skin-tone-1:");
        }
    } catch (err) {
        message.channel.send("Uh, oh, something went wrong :/");
        console.error(err);
    }
}

function shuffleQueue(message, server) {
	try {
		for(var i = 0; i < server.queue.length; i++) {
			server.queue[i].number = Math.random();
		}
		mergeSort(0, server.queue.length - 1, message);
		if (server.queue[server.queue.length - 1].number == 2) {
			server.queue.splice(server.queue.length - 1, 1);
		}
	} catch (err) {
		console.error(err);
	}
}

function mergeSort(left, right, message) {
    try {
        if (right <= left)
            return;
        var middle = parseInt((left + right) / 2);
        mergeSort(left, middle, message);
        mergeSort(middle + 1, right, message);
        var arr = servers[message.guild.id].queue;
        var leftArr = [];
        var rightArr = [];
        for(var i = left; i <= middle; i++)
            leftArr[i] = arr[i];
        for(var i = middle + 1; i <= right; i++)
            rightArr[i] = arr[i];
        leftArr.push({ number: 2});
        rightArr.push({ number: 2});
        var pos = left;
        for(var a = left, b = middle + 1; pos <= right; pos++) {
            if (leftArr[a].number <= rightArr[b].number) {
                arr[pos] = leftArr[a];
                a++;
            } else {
                arr[pos] = rightArr[b];
                b++;
            }
        }
    } catch (err) {
        message.channel.send("Uh, oh, something went wrong :/");
        console.error(err);
    }
}

async function sendThumbnail(str, message) {
    try {
		const pos = str.indexOf("v=");
		const id = str.substr(pos + 2, pos + 13);
        const info = await fetchVideoInfo(id);
        const url = await info.thumbnailUrl;
        var embed = new Discord.RichEmbed()
            .setTitle(info.title)
            .setColor((message.member.colorRole ? message.member.colorRole.hexColor : [255, 100, 255]))
            .addField("Link for ya", url)
            .setImage(url);
        message.channel.send(embed);
    } catch (err) {
        message.channel.send("Uh, oh, something went wrong :/");
        console.error(err);
    }
}

async function vote(str, message) {
    try {
        const opt1 = str[0];
        const opt2 = str[1];
        if(!/\w+/.test(opt1) || !/\w+/.test(opt2)) {
            message.channel.send("You must provide two existing arguments: \"!vote { option #1 } vs { option #2 }\"");
            return;
        }
        const embed = new Discord.RichEmbed()
            .setTitle("**Voting: " + opt1 + " vs " + opt2 + "**")
            .setColor((message.member.colorRole ? message.member.colorRole.hexColor : [255, 100, 255]))
            .setImage("http://images4.wikia.nocookie.net/__cb20121120132360/penguinsofmadagascar/images/a/a7/Kowalski_2.jpg")
        const sentEmbed = await message.channel.send(embed);
        const filter = (reaction, user) => reaction._emoji.name === "✅" || reaction._emoji.name === "❎"
        const collector = await sentEmbed.createReactionCollector(filter, { time: 20000 });
        collector.on("collect", (reaction, user) => {
            const yes = sentEmbed.reactions.find( val => val._emoji.name === "✅");
            const no = sentEmbed.reactions.find( val => val._emoji.name === "❎");
            reaction.users.array().forEach((el, index) => {						// DENYING DOUBLE VOTES
                if (el.id != bot.user.id) {
                    if (reaction._emoji.name === "✅") {
                        no.users.array().forEach(val => {
                            if(el.id == val.id)
                                no.remove(el);
                        });
                    } else if (reaction._emoji.name === "❎") {
                        yes.users.array().forEach(val => {
                            if(el.id == val.id)
                                yes.remove(el);
                        });
                    }
                }
            });
        });
        collector.on("end", collected => {
			sentEmbed.react(emojis["stop_sign"]);
            const yes = collected.find( val => val._emoji.name === "✅");
            const no = collected.find( val => val._emoji.name === "❎");
            yes.remove(bot.user);
            no.remove(bot.user);
            const newEmbed = new Discord.RichEmbed()
                .setColor((message.member.colorRole ? message.member.colorRole.hexColor : [255, 100, 255]))
                .addField("**" + opt1 + "**", yes.count - 1, true)
                .addField("**" + opt2 + "**", no.count - 1, true)
            if (yes.count == no.count) {
                newEmbed.setTitle("**We've got a draw**");
            } else {
                newEmbed.setTitle("**Winner: " + (yes.count > no.count ? opt1 : opt2) + "**");
            }
            message.channel.send(newEmbed);
        });
        await sentEmbed.react("✅");
        await sentEmbed.react("❎");
    } catch (err) {
        message.channel.send("Uh, oh, something went wrong :/");
        console.error(err);
    }
}

async function searchUrban(str, message) {
	try {
		const response = await fetch("http://api.urbandictionary.com/v0/define?term=" + encodeURIComponent(str));
		const json = await response.json();
		var item = null;
		for (var i = 0; i < 0 || json.list.length && item === null; i++) {
			if (json.list[i].word.toLowerCase() == str.toLowerCase()) {
				item = json.list[i];
			}
		}
		if (item === null) {
			message.channel.send("It appears that there's no such phrase as: `" + str + "` on Urban Dictionary" + (json.list[0] ? ", maybe try: " + json.list[0].word : ""));
			return;
		}
		var msg = "**" + item.word + ":**\n" + item.definition.replace(/\[([^\].]+)\]/g, "__$1__") + "\n\n**Example:**\n" + item.example.replace(/\[([^\].]+)\]/g, "__$1__");
		const maxMsgLength = 2000;
		if (msg.length > maxMsgLength) {
			msg = msg.substr(0, maxMsgLength - 100) + "...\nFull definition at: https://www.urbandictionary.com/define?term=" + encodeURIComponent(str);
		}
		message.channel.send(msg);
	} catch (err) {
		message.channel.send("Uh, oh, something went wrong");
		console.error(err);
	}
}

async function searchTenorGif(str, message) {
	try {
		const response = await fetch("https://api.tenor.com/v1/search?limit=10&q=" + str + "&key=" + tenor_api_key + "&anon_id=" + tenor_anon_id + "&media_filter=basic");
		const json = await response.json();
		if (!json.results || !json.results[0]) {
			message.channel.send("I haven't found a gif for you :/");
			return;
		}
		var pos = 0;
		var msg = await message.channel.send(json.results[pos].url);
		const filter = (reaction, user) => user.id !== bot.user.id && (reaction.emoji.name == emojis["arrow_left"] || reaction.emoji.name == emojis["arrow_right"])
		const collector = msg.createReactionCollector(filter, { time: 30000 });
		collector.on("collect", async reaction => {
			await msg.clearReactions();
			if (reaction.emoji.name == emojis["arrow_left"]) {
				pos--;
			} else if (reaction.emoji.name == emojis["arrow_right"]) {
				pos++;
			}
			msg = await msg.edit(json.results[pos].url);
			if (pos > 0) {
				await msg.react(emojis["arrow_left"]);
			}
			if (pos < json.results.length) {
				await msg.react(emojis["arrow_right"]);
			}
		})
		collector.on("end", async () => {
			await msg.clearReactions();
			await msg.react(emojis["stop_sign"]);
		})
		if (pos > 0) {
			await msg.react(emojis["arrow_left"]);
		}
		if (pos < json.results.length) {
			await msg.react(emojis["arrow_right"]);
		}
	} catch (err) {
		message.channel.send("Uh, oh, something went wrong");
		console.error(err);
	}
}

async function managePlaylistData(parameters, message) {
	try {
		const server = servers[message.guild.id];
		if (parameters[0] == "admin" && message.member.id == myID) {
			// const channel = await message.author.createDM();
			console.log(playlistData)
			return;
		}
		if (!parameters[2]) {
			message.channel.send("`!playlist { public|private } { add|print|remove } { playlist-link|?value }`\nvalue: name or \'$all\'");
			return;
		}
		if (parameters[0] == "private") {
			switch (parameters[1]) {
				case "add":
					if (/[^\w-_]/.test(parameters[2])) {
						message.channel.send(`You can't use any other signs than letters, \'-\' and \'_\' in: \`${parameters[2]}\`` + "\nProper command: \`!playlist private add { name } { link }\`");
						break;
					}
					if (!playlistRegex.test(parameters[3])) {
						message.channel.send(`\`${parameters[3]}\` doesn't seem to be a link to a youtube playlist` + "\nProper command: \`!playlist private add { name } { link }\`");
						break;
					}
					if (!playlistData.users[message.member.id]) {
						playlistData.users[message.member.id] = {};
					}
					playlistData.users[message.member.id][parameters[2]] = parameters[3];
					savePlaylistData();
					message.channel.send(`I added: **${parameters[2]}** to your collection`);
					break;
				case "print":
					if (parameters[2] == "$all") {
						if (!playlistData.users[message.member.id]) {
							message.reply("You don't have any saved playlists in your collection");
							break;
						}
						var msg = "Playlists saved in your collection:";
						var pos = 0;
						for (var prop in playlistData.users[message.member.id]) {
							pos++;
							msg += (`\n${pos}. ${prop}`);
						}
						message.reply(msg);
						break;
					}
					if (!playlistData.users[message.member.id] || !playlistData.users[message.member.id][parameters[2]]) {
						message.channel.send(`There is no such item as: \`${parameters[2]}\` in your collection`);
						break;
					}
					message.channel.send(`<${playlistData.users[message.member.id][parameters[2]]}>`);
					break;
				case "play":
					if (!playlistData.users[message.member.id] || !playlistData.users[message.member.id][parameters[2]]) {
						message.reply("You don't have any saved playlists in your collection");
						break;
					}
					await addYtPlaylistToQueue(playlistData.users[message.member.id][parameters[2]], message, true);
					break;
				case "remove":
					if (parameters[2] == "$all") {
						if (!playlistData.users[message.member.id]) {
							if (!playlistData.users[message.member.id]) {
								message.reply("You don't have any saved playlists in your collection");
								break;
							}
						}
						delete playlistData.users[message.member.id];
						message.channel.send("I removed your whole collection");
						break;
					}
					if (!playlistData.users[message.member.id] || !playlistData.users[message.member.id][parameters[2]]) {
						message.channel.send(`There is no such item as: \`${parameters[2]}\` in your collection`);
						break;
					}
					delete playlistData.users[message.member.id][parameters[2]];
					if (Object.keys(playlistData.users[message.member.id]).length === 0) {
						delete playlistData.users[message.member.id];
					}
					savePlaylistData();
					message.channel.send(`I removed: **${parameters[2]}** from your collection`);
					break;
				default:
					message.channel.send("`!playlist { public|private } { add|print|remove } { playlist-link|?value|?value }`\nvalue: name or \'$all\'");
					break;
			}
		}
		else if (parameters[0] == "public") {
			switch (parameters[1]) {
				case "add":
					if (/[^\w-_]/.test(parameters[2])) {
						message.channel.send(`You can't use any other signs than letters, \'-\' and \'_\' in: \`${parameters[2]}\`` + "\nProper command: \`!playlist public add { name } { link }\`");
						break;
					}
					if (!playlistRegex.test(parameters[3])) {
						message.channel.send(`\`${parameters[3]}\` doesn't seem to be a link to a youtube playlist` + "\nProper command: \`!playlist public add { name } { link }\`");
						break;
					}
					playlistData.public[parameters[2]] = parameters[3];
					savePlaylistData();
					message.channel.send(`I added: **${parameters[2]}** to your collection`);
					break;
				case "print":
					if (parameters[2] == "$all") {
						if (!playlistData.public) {
							message.reply("You don't have any saved playlists in your collection");
							break;
						}
						var msg = "Playlists saved in your collection:";
						var pos = 0;
						for (var prop in playlistData.public) {
							pos++;
							msg += (`\n${pos}. ${prop}`);
						}
						message.reply(msg);
						break;
					}
					if (!playlistData.public[parameters[2]]) {
						message.channel.send(`There is no such item as: \`${parameters[2]}\` in my public collection`);
						break;
					}
					message.channel.send(`<${playlistData.public[parameters[2]]}>`);
					break;
				case "play":
					if (!playlistData.public[parameters[2]]) {
						message.channel.send(`There is no such item as: \`${parameters[2]}\` in my public collection`);
						break;
					}
					await addYtPlaylistToQueue(playlistData.public[parameters[2]], message, true);
					break;
				case "remove":
					if (parameters[2] == "$all") {
						if (!playlistData.public) {
							message.reply("I don't have any saved playlist in my public collection");
							break;
						}
						delete playlistData.public;
						message.channel.send("I removed my whole public collection");
						break;
					}
					if (!playlistData.public[parameters[2]]) {
						message.channel.send(`There is no such item as: \`${parameters[2]}\` in my public collection`);
						break;
					}
					delete playlistData.public[parameters[2]];
					if (Object.keys(playlistData.public).length === 0) {
						delete playlistData.public;
					}
					savePlaylistData();
					message.channel.send(`I removed: **${parameters[2]}** from my public collection`);
					break;
				default:
					message.channel.send("`!playlist { public|private } { add|print|remove } { playlist-link|?value|?value }`\nvalue: name or \'$all\'");
					break;
			}
		}
		else {
			message.channel.send("`!playlist { public|private } { add|print|remove } { playlist-link|?value|?value }`\nvalue: name or \'$all\'");
			return;
		}
	} catch (err) {
		message.channel.send("Uh, oh, something went wrong");
		console.error(err);
	}
}

function savePlaylistData() {
	fs.writeFileSync("playlist-data.json", JSON.stringify(playlistData), function(str) {});
}

bot.login(token);

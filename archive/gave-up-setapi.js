const settings = require("./pterosettings.json");
const cooldown = new Set();

const prefix = settings.prefix
const panellink = settings.panellink
const bottoken = settings.token
const color = settings.color
const sharedapi = settings.sharedapi
const sharedfocus = settings.sharedfocus
const disablelinkscmd = settings.disablelinkscmd
const footername = settings.footername
const footerimage = settings.footerimage

const request = require('request');
const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require('fs');
const config = require("./config.json");

const errorsetapiembed = new Discord.MessageEmbed()
  .setAuthor("You must set an API key!")
  .setColor(color)
  .setDescription("You must set your API key using the `" + prefix + "setapi <api code>` command before running this command.\n***RUN THE SET API KEY COMMAND IN THE BOTS DMS!!!***")
  .setFooter(footername, footerimage)

const argssetapiembed = new Discord.MessageEmbed()
  .setAuthor("Incorrect usage.")
  .setColor(color)
  .setDescription("Please use `" + prefix + "setapi <api code>` instead!")
  .setFooter(footername, footerimage)

const invalidapicodeembed = new Discord.MessageEmbed()
  .setAuthor("Invalid API code.")
  .setColor(color)
  .setDescription("Please enter a valid API code.")
  .setFooter(footername, footerimage)

const setapicodesuccessembed = new Discord.MessageEmbed()
  .setAuthor("Success!")
  .setColor(color)
  .setDescription("Successfully added your API code to the database.")
  .setFooter(footername, footerimage)

const argsfocusembed = new Discord.MessageEmbed()
  .setAuthor("Incorrect usage.")
  .setColor(color)
  .setDescription("Please use `" + prefix + "focus <server id>` instead!")
  .setFooter(footername, footerimage)

const invalidfocusembed = new Discord.MessageEmbed()
  .setAuthor("Invalid server ID.")
  .setColor(color)
  .setDescription("Please enter a valid server ID.")
  .setFooter(footername, footerimage)

const focussuccessembed = new Discord.MessageEmbed()
  .setAuthor("Success!")
  .setColor(color)
  .setDescription("Successfully added your server ID to the database.")
  .setFooter(footername, footerimage)

const nodelapiembed = new Discord.MessageEmbed()
  .setAuthor("API key not set.")
  .setColor(color)
  .setDescription("You have not registered an API key to the database.")
  .setFooter(footername, footerimage)

const yesdelapiembed = new Discord.MessageEmbed()
  .setAuthor("Success!")
  .setColor(color)
  .setDescription("The API key has been removed from the database.")
  .setFooter(footername, footerimage)

const nodelfocusembed = new Discord.MessageEmbed()
  .setAuthor("API key not set.")
  .setColor(color)
  .setDescription("You have not registered an API key to the database.")
  .setFooter(footername, footerimage)

const yesdelfocusembed = new Discord.MessageEmbed()
  .setAuthor("Success!")
  .setColor(color)
  .setDescription("The API key has been removed from the database.")
  .setFooter(footername, footerimage)

const mustfocusserver = new Discord.MessageEmbed()
  .setAuthor("You must focus a server!")
  .setColor(color)
  .setDescription("You must set your focused server using the `" + prefix + "focus` command before running this command.")
  .setFooter(footername, footerimage)

client.on("ready", () => {
  console.log("Bot is ready!");
  if (settings.statusname && settings.statustype) {
    client.user.setActivity(settings.statusname, { type: settings.statustype });
  }
  fileSave();
});

client.on("message", async message => {
  try {
    if (settings.whitelist) if (!settings.whitelist.includes(message.author.id.toString())) return;
    
    if (message.content.startsWith(prefix) && !message.content.startsWith(prefix + " ")) {
      let fullcmd = message.content.toLowerCase().slice(prefix.length);
      let cmd = fullcmd.split(" ")[0].toString();

      if (fs.existsSync('./customcmds/' + cmd + ".txt")) {
        if (config["api_" + message.author.id] || typeof sharedapi == "string") {
          if (typeof sharedapi == "string") {
            api = sharedapi
          } else {
            api = decodeURIComponent(config["api_" + message.author.id])
          }
        } else {
          api == null
        }
        if (typeof sharedfocus == "string") {
          focused = sharedfocus;
        } else {
          if (config["focus_" + message.author.id]) {
            focused = decodeURIComponent(config["focus_" + message.author.id])
          } else {
            focused = "none"
          }
        }
        if (panellink.slice(-1) == "/") {
          actualpanellink = panellink.slice(0,-1)
        } else {
          actualpanellink = panellink
        }
        let code = fs.readFileSync('./customcmds/' + cmd + ".txt").toString().split('\n');
        // Checking Requirements
        loopnum = 0
        cooldownnum = 0
        while (loopnum < code.length) {
          if (code[loopnum].trimStart().startsWith("power ") || code[loopnum].trim() == "power" || code[loopnum].trimStart().startsWith("send ") || code[loopnum].trim() == "send") {
            cooldownnum = cooldownnum + 1
            if (api !== null) {
              if (focused == "none") {
                message.channel.send(mustfocusserver)
                return
              }
            } else {
              message.channel.send(errorsetapiembed);
              return
            }
          }
          loopnum = loopnum + 1
        }
        if (cooldownnum !== 0) {
          if (cooldown.has("global")) return;
          cooldown.add("global");
          setTimeout(() => {
            cooldown.delete("global");
          }, cooldownnum);
          await customCommands(client, message, cmd, code, 0, actualpanellink, focused, 1)
        } else {
          await customCommands(client, message, cmd, code, 0, actualpanellink, focused, 0)
        }
      }

      if (fullcmd.startsWith("help ") || fullcmd == "help") {
        if (typeof sharedapi !== "string") {
          addapioptions = "\n`" + prefix + "setapi` **-** Set your API in the database. *run this command in the bot's dms*\n`" + prefix + "delapi` **-** Delete the API key from the database."
        } else {
          addapioptions = ""
        }
        if (typeof sharedfocus !== "string") {
          addfocusoptions = "\n`" + prefix + "focus` **-** Focus a server using the server ID.\n`" + prefix + "delfocus` **-** Delete the focused server from the database.\n`" + prefix + "listservers` **-** Shows the list of servers you own."
        } else {
          addfocusoptions = ""
        }
        if (disablelinkscmd == 1) {
          addlinkscmdoption = ""
        } else {
          addlinkscmdoption = "\n`" + prefix + "links` **-** Shows links to the Pterodactyl panel."
        }
        let embed = new Discord.MessageEmbed()
          .setAuthor("Help")
          .setColor(color)
          .setDescription("`" + prefix + "help` **-** The help command." + addlinkscmdoption + addapioptions + addfocusoptions + "\n`" + prefix + "info` **-** Shows your focused server's information.\n`" + prefix + "power` **-** Use power signals to the focused server.\n`" + prefix + "send` **-** Send a message to the focused server.")
          .setFooter(footername, footerimage)
        message.channel.send(embed)
        return
      }
      if (sharedapi == undefined || sharedapi == null) {
        if (fullcmd.startsWith("setapi ") || fullcmd == "setapi") {
          if (fullcmd == "setapi") {
            message.channel.send(argssetapiembed);
            return;
          } else {
            if (message.content.slice(7 + prefix.length).length !== 48) {
              message.channel.send(invalidapicodeembed);
              return;
            } else {
              configSet("api_" + message.author.id, message.content.slice(7 + prefix.length));
              message.channel.send(setapicodesuccessembed);
              return;
            }
          }
        }
        if (fullcmd.startsWith("delapi ") || fullcmd == "delapi") {
          if (config["api_" + message.author.id]) {
            configSet("api_" + message.author.id, "");
            message.channel.send(yesdelapiembed);
          } else {
            message.channel.send(nodelapiembed);
          }
          return
        }
      }

      if (sharedfocus == undefined || sharedfocus == null) {
        if (fullcmd.startsWith("focus ") || fullcmd == "focus") {
          if (fullcmd == "focus") {
            message.channel.send(argsfocusembed);
            return;
          } else {
            if (message.content.slice(6 + prefix.length).length !== 8) {
              message.channel.send(invalidfocusembed);
              return;
            } else {
              configSet("focus_" + message.author.id, message.content.slice(6 + prefix.length));
              message.channel.send(focussuccessembed);
              return;
            }
          }
        }
        if (fullcmd.startsWith("delfocus ") || fullcmd == "delfocus") {
          if (config["focus_" + message.author.id]) {
            configSet("focus_" + message.author.id, "");
            message.channel.send(yesdelfocusembed);
          } else {
            message.channel.send(nodelfocusembed);
          }
          return
        }
      }

      if (fs.existsSync('./apicommands/' + cmd + ".js")) {
        if (config["api_" + message.author.id] || typeof sharedapi == "string") {
          if (cooldown.has("global")) return;
          if (typeof sharedfocus == "string" && cmd == "listservers") return;
          if (cmd == "links" && disablelinkscmd == 1) return;
          if (cmd == "info" || cmd == "power" && settings.checkpower == 1 || cmd == "send" && settings.checksend == 1) {
            cooldownnum = 2
          } else {
            cooldownnum = 1
          }
          cooldown.add("global");
          setTimeout(() => {
            cooldown.delete("global");
          }, cooldownnum * 1000);
          if (typeof sharedapi == "string") {
            api = sharedapi
          } else {
            api = decodeURIComponent(config["api_" + message.author.id])
          }
          try {
            let requiredfile = require("./apicommands/" + cmd + ".js");
            if (typeof sharedfocus == "string") {
              focused = sharedfocus;
            } else {
              if (config["focus_" + message.author.id]) {
                focused = decodeURIComponent(config["focus_" + message.author.id])
              } else {
                focused = "none"
              }
            }
            if (panellink.slice(-1) == "/") {
              actualpanellink = panellink.slice(0,-1)
            } else {
              actualpanellink = panellink
            }
            requiredfile.run(client, message, api, focused, prefix, actualpanellink, color, footername, footerimage);
          } catch(err1) {
            console.log(err1);
          }
        } else {
          message.channel.send(errorsetapiembed);
          return;
        }
        return;
      }
    }
  } catch(err) {
    console.log(err);
  }
});

client.login(bottoken)

async function configSet(name, response, actualpanellink, focused) {
  try {
    if (config[name] === undefined) {
    } else {
      await delete config[name];
    }
    if (response.toString() === "") {} else {
      config[name.toString()] = encodeURIComponent(response.toString());
    }
  } catch(err) {}
}

function fileSave() {
  fs.writeFile("config.json", JSON.stringify(config, null, 2), function(err) {
  if (err) throw err;
  });
  setTimeout(() => {
    fileSave();
  }, 1000);
}

async function customCommands(client, message, cmd, code, loopnum, actualpanellink, focused, requiredapifocus) {
  // Running
  if (code[loopnum].trimStart().startsWith("power ") || code[loopnum].trim() == "power") {
    if (code[loopnum].trim() == "power") {
      console.log("An error has occured in line " + (loopnum + 1) + " when running the custom command: " + cmd)
      console.log("CODE power1: Missing first argument (start/restart/stop/kill).")
    } else {
      if (code[loopnum].trim().slice("power ".length) == "start" || code[loopnum].trim().slice("power ".length).startsWith("start ") || code[loopnum].trim().slice("power ".length) == "restart" || code[loopnum].trim().slice("power ".length).startsWith("restart ") || code[loopnum].trim().slice("power ".length) == "stop" || code[loopnum].trim().slice("power ".length).startsWith("stop ") || code[loopnum].trim().slice("power ".length) == "kill" || code[loopnum].trim().slice("power ".length).startsWith("kill")) {
        if (code[loopnum].trim().slice("power ".length) == "start" || code[loopnum].trim().slice("power ".length).startsWith("start ")) {
          powertype = "start"
          freevar = code[loopnum].trim().slice("power ".length).slice("start ".length)
        } else if (code[loopnum].trim().slice("power ".length) == "stop" || code[loopnum].trim().slice("power ".length).startsWith("stop ")) {
          powertype = "stop"
          freevar = code[loopnum].trim().slice("power ".length).slice("stop ".length)
        } else if (code[loopnum].trim().slice("power ".length) == "restart" || code[loopnum].trim().slice("power ".length).startsWith("restart ")) {
          powertype = "restart"
          freevar = code[loopnum].trim().slice("power ".length).slice("restart ".length)
        } else if (code[loopnum].trim().slice("power ".length) == "kill" || code[loopnum].trim().slice("power ".length).startsWith("kill ")) {
          powertype = "kill"
          freevar = code[loopnum].trim().slice("power ".length).slice("kill ".length)
        }
        request.post(actualpanellink + '/api/client/servers/' + focused + '/power', {
          headers: {'content-type': 'application/json'},
          'auth': {
            'bearer': api
          },
          body: `{ "signal": "${powertype}" }`
        }, function(error, response, test) {
          if (response.statusCode !== 204) {
            output = "else"
          } else {
            output = "goto"
          }
          if (freevar.trim() !== "") {
            if (freevar.startsWith("goto ") || freevar == "goto" || freevar.startsWith("else ") || freevar == "else") {
              if (freevar == "goto" || freevar == "else" || freevar.slice(5).trim() == "") {
                console.log("An error has occured in line " + (loopnum + 1) + " when running the custom command: " + cmd)
                console.log("CODE power4: Must include number (or line of code).")
              } else {
                if (isNaN(parseFloat(freevar.slice(5)))) {
                  console.log("An error has occured in line " + (loopnum + 1) + " when running the custom command: " + cmd)
                  console.log("CODE power5: Invalid number (or line of code).")
                } else {
                  if (freevar.startsWith(output)) {
                    customCommandsEnd(client, message, cmd, code, parseFloat(freevar.slice(5)) - 2, actualpanellink, focused, requiredapifocus);
                  } else {
                    customCommandsEnd(client, message, cmd, code, loopnum, actualpanellink, focused, requiredapifocus);
                  }
                }
              }
            } else {
              console.log("An error has occured in line " + (loopnum + 1) + " when running the custom command: " + cmd)
              console.log("CODE power3: Missing or invalid second argument (goto/else).")
            }
          } else {
            customCommandsEnd(client, message, cmd, code, loopnum, actualpanellink, focused, requiredapifocus);
          }
        });
      } else {
        console.log("An error has occured in line " + (loopnum + 1) + " when running the custom command: " + cmd)
        console.log("CODE power2: Invalid first argument (start/restart/stop/kill).")
      }
    }
    return;
  } else if (code[loopnum].trimStart().startsWith("msg ") || code[loopnum].trim() == "msg" || code[loopnum].trimStart().startsWith("say ") || code[loopnum].trim() == "say") {
    if (code[loopnum].trim() == "msg" || code[loopnum].trim() == "say") {
      console.log("An error has occured in line " + (loopnum + 1) + " when running the custom command: " + cmd)
      console.log("CODE msg1: Message cannot be empty.")
    } else {
      if (code[loopnum].trim().slice(4).replace(/\\n/g, "\n").replace(/%prefix%/g, prefix).replace(/%args%/g, message.content.trim().slice(prefix.length + cmd.length + 1).trim()).length > 2000) {
        console.log("An error has occured in line " + (loopnum + 1) + " when running the custom command: " + cmd)
        console.log("CODE msg2: Message cannot be over 2000 characters.")
      } else {
        message.channel.send(code[loopnum].trim().slice(4).replace(/\\n/g, "\n").replace(/%prefix%/g, prefix).replace(/%args%/g, message.content.trim().slice(prefix.length + cmd.length + 1).trim()))
        customCommandsEnd(client, message, cmd, code, loopnum, actualpanellink, focused, requiredapifocus);
      }
    }
    return;
  } else if (code[loopnum].trimStart().startsWith("log ") || code[loopnum].trim() == "log") {
    if (code[loopnum].trim() == "log") {
      console.log("An error has occured in line " + (loopnum + 1) + " when running the custom command: " + cmd)
      console.log("CODE log1: Log message cannot be empty.")
    } else {
      console.log(code[loopnum].trim().slice(4).replace(/\\n/g, "\n").replace(/%prefix%/g, prefix).replace(/%args%/g, message.content.trim().slice(prefix.length + cmd.length + 1).trim()))
      customCommandsEnd(client, message, cmd, code, loopnum, actualpanellink, focused, requiredapifocus);
    }
    return;
  } else if (code[loopnum].trimStart().startsWith("embed ") || code[loopnum].trim() == "embed") {
    if (code[loopnum].trim() == "embed") {
      console.log("An error has occured in line " + (loopnum + 1) + " when running the custom command: " + cmd)
      console.log("CODE embed1: Embed message cannot be empty.")
    } else {
      if (code[loopnum].trim().slice("embed ".length).replace(/\\n/g, "\n").replace(/%prefix%/g, prefix).replace(/%args%/g, message.content.trim().slice(prefix.length + cmd.length + 1).trim()).length > 2000) {
        console.log("An error has occured in line " + (loopnum + 1) + " when running the custom command: " + cmd)
        console.log("CODE embed2: Message cannot be over 2000 characters.")
      } else {
        let embed = new Discord.MessageEmbed()
          .setColor(color)
          .setDescription(code[loopnum].trim().slice("embed ".length).replace(/\\n/g, "\n").replace(/%prefix%/g, prefix).replace(/%args%/g, message.content.trim().slice(prefix.length + cmd.length + 1).trim()))
          .setFooter(footername, footerimage)
        message.channel.send(embed)
        customCommandsEnd(client, message, cmd, code, loopnum, actualpanellink, focused, requiredapifocus);
      }
    }
    return;
  } else if (code[loopnum].trimStart().startsWith("send ") || code[loopnum].trim() === "send") {
    if (code[loopnum].trim() == "send" || code[loopnum].trim().slice(5).replace(/%args%/g, message.content.trim().slice(prefix.length + cmd.length + 1).trim()) == "") {
      console.log("An error has occured in line " + (loopnum + 1) + " when running the custom command: " + cmd)
      console.log("CODE send1: Missing argument (or command).")
    } else {
      request.post(actualpanellink + '/api/client/servers/' + focused + '/command', {
        headers: {'content-type': 'application/json'},
        'auth': {
          'bearer': api
        },
        body: `{ "command": "${code[loopnum].trim().slice("send ".length).replace(/%args%/g, message.content.trim().slice(prefix.length + cmd.length + 1).trim())}" }`
      }, function(error, response, test) {
        if (response.statusCode !== 204) {
          output = "else"
        } else {
          output = "goto"
        }
        if (code[loopnum + 1].trim().startsWith("- goto") || code[loopnum + 1].trim().startsWith("- else")) {
          if (code[loopnum + 1].trim().slice(2).trim() == "goto" || code[loopnum + 1].trim().slice(2).trim() == "else") {
            console.log("An error has occured in line " + (loopnum + 2) + " when running the custom command: " + cmd)
            console.log("CODE send2: Missing argument (number).")
          } else {
            if (isNaN(parseFloat(code[loopnum + 1].trim().slice(2).trim().slice(5)))) {
              console.log("An error has occured in line " + (loopnum + 2) + " when running the custom command: " + cmd)
              console.log("CODE send3: Invalid number.")
            } else {
              if (code[loopnum + 1].trim().slice(2).trim().startsWith(output)) {
                customCommandsEnd(client, message, cmd, code, parseFloat(code[loopnum + 1].trim().slice(2).trim().slice(5)) - 2, actualpanellink, focused, requiredapifocus);
              } else {
                customCommandsEnd(client, message, cmd, code, loopnum + 1, actualpanellink, focused, requiredapifocus);
              }
            }
          }
        } else {
          customCommandsEnd(client, message, cmd, code, loopnum, actualpanellink, focused, requiredapifocus);
        }
      });
    }
    return;
  } else if (code[loopnum].trimStart().startsWith("stop ") || code[loopnum].trim() === "stop") {
    if (code[loopnum].trim() !== "stop") {
      console.log("Warning message in line " + (loopnum + 1) + " when running the custom command: " + cmd)
      console.log(`CODE stop1: There should not be arguments for "stop".`)
    }
    return;
  } else if (code[loopnum].trimStart().startsWith("wait ") || code[loopnum].trim() === "wait") {
    if (code[loopnum].trim() == "wait") {
      console.log("An error has occured in line " + (loopnum + 1) + " when running the custom command: " + cmd)
      console.log("CODE wait1: Missing argument (or delay number in millisecond).")
      return;
    } else {
      if (isNaN(parseFloat(code[loopnum].trim().slice("wait ".length)))) {
        console.log("An error has occured in line " + (loopnum + 1) + " when running the custom command: " + cmd)
        console.log("CODE wait2: Missing first argument (goto/else)")
        return;
      } else {
        setTimeout(() => {
          customCommandsEnd(client, message, cmd, code, loopnum, actualpanellink, focused, requiredapifocus);
        }, parseFloat(code[loopnum].trim().slice("wait ".length)));
        return;
      }
    }
  } else if (code[loopnum].trimStart().startsWith("ifargs ") || code[loopnum].trim() === "ifargs") {
    if (code[loopnum].trim() !== "ifargs") {
      if (code[loopnum].trim().slice("ifargs ".length).trim().startsWith("goto ") || code[loopnum].trim().slice("ifargs ".length).trim().startsWith("else ") || code[loopnum].trim().slice("ifargs ".length).trim() == "goto" || code[loopnum].trim().slice("ifargs ".length).trim() == "else") {
        if (code[loopnum].trim().slice("ifargs ".length).trim() == "goto" || code[loopnum].trim().slice("ifargs ".length).trim() == "else") {
          console.log("An error has occured in line " + (loopnum + 1) + " when running the custom command: " + cmd)
          console.log("CODE ifargs3: Missing second argument (or line number).")
          return;
        } else {
          if (isNaN(code[loopnum].trim().slice("ifargs ".length).trim().slice(5).trim())) {
            console.log("An error has occured in line " + (loopnum + 1) + " when running the custom command: " + cmd)
            console.log("CODE ifargs4: Invalid number (or line number).")
            return;
          } else {
            if (code[loopnum].trim().slice("ifargs ".length).trim().startsWith("goto ")) {
              if (message.content.trim().slice(prefix.length + cmd.length + 1).trim() == "") {
                customCommandsEnd(client, message, cmd, code, loopnum, actualpanellink, focused, requiredapifocus);
                return;
              } else {
                customCommandsEnd(client, message, cmd, code, code[loopnum].trim().slice("ifargs ".length).trim().slice(5).trim() - 2, actualpanellink, focused, requiredapifocus);
                return;
              }
            } else { // else
              if (message.content.trim().slice(prefix.length + cmd.length + 1).trim() !== "") {
                customCommandsEnd(client, message, cmd, code, loopnum, actualpanellink, focused, requiredapifocus);
                return;
              } else {
                customCommandsEnd(client, message, cmd, code, code[loopnum].trim().slice("ifargs ".length).trim().slice(5).trim() - 2, actualpanellink, focused, requiredapifocus);
                return;
              }
            }
          }
        }
      } else {
        console.log("An error has occured in line " + (loopnum + 1) + " when running the custom command: " + cmd)
        console.log("CODE ifargs2: Invalid first argument (goto/else).")
        return;
      }
    } else {
      console.log("An error has occured in line " + (loopnum + 1) + " when running the custom command: " + cmd)
      console.log("CODE ifargs1: Missing first argument.")
      return 
    }
    return;
  } else if (code[loopnum].trimStart().startsWith("setapi ") || code[loopnum].trim() === "setapi") {
    if (code[loopnum].trim() === "setapi") {
      console.log("An error has occured in line " + (loopnum + 1) + " when running the custom command: " + cmd)
      console.log("CODE setapi1: Missing first argument. (temp/set/delete)")
    } else {
      if (code[loopnum].trim().slice("setapi ".length) == "temp" || code[loopnum].trim().slice("setapi ".length) == "set" || code[loopnum].trim().slice("setapi ".length) == "delete") {
        if (code[loopnum].trim().slice("setapi ".length) == "delete") {
          if (code[loopnum].trim().slice("setapi delete".length).trim() !== "") {
            console.log("Warning message in line " + (loopnum + 1) + " when running the custom command: " + cmd)
            console.log("CODE setapi3: There should not be a second argument.")
          }
          configSet("api_" + message.author.id, "");
          if (requiredapifocus == 1) {
            api = ""
            customCommandsEnd(client, message, cmd, code, loopnum, actualpanellink, focused, requiredapifocus);
          } else {
            console.log("Warning message in line " + (loopnum + 1) + " when running the custom command: " + cmd)
            console.log("CODE setapi4: The command has forcefully stopped from running another line because this script requires an API code and this just removed the API code from the user.")
          }
        } else {
          if (code[loopnum].trim().slice("setapi ".length) == "set") {
            slicenum = 4
          } else { // "temp"
            slicenum = 5
          }
          if (code[loopnum].trim().slice("setapi ".length).slice(slicenum).trim() == "") {
            console.log("An error has occured in line " + (loopnum + 1) + " when running the custom command: " + cmd)
            console.log("CODE setapi5: Missing API code.")
          } else {
            if (code[loopnum].trim().slice("setapi ".length).slice(slicenum).trim().length !== 48) {
              console.log("An error has occured in line " + (loopnum + 1) + " when running the custom command: " + cmd)
              console.log("CODE setapi6: An API code must be 48 characters.")
            } else {
              if (code[loopnum].trim().slice("setapi ".length) == "set") {
                configSet("api_" + message.author.id, code[loopnum].trim.slice("setapi ".length).slice(slicenum).trim())
              }
              api = code[loopnum].trim().slice("setapi ".length).slice(slicenum).trim()
              customCommandsEnd(client, message, cmd, code, loopnum, actualpanellink, focused, requiredapifocus);
            }
          }
        }
      } else {
        console.log("An error has occured in line " + (loopnum + 1) + " when running the custom command: " + cmd)
        console.log("CODE setapi2: Invalid first argument. (temp/set/delete)")
      }
    }
    return;
  } else if (code[loopnum].trimStart().startsWith("#")) {
    customCommandsEnd(client, message, cmd, code, loopnum, actualpanellink, focused, requiredapifocus);
    return;
  } else {
    if (code[loopnum].trim() == "") {
      customCommandsEnd(client, message, cmd, code, loopnum, actualpanellink, focused, requiredapifocus);
    } else {
      console.log("An error has occured in line " + (loopnum + 1) + " when running the custom command: " + cmd)
      console.log(`CODE unknown: Unknown command type: ` + code[loopnum].trim())
    }
    return;
  }
}

async function customCommandsEnd(client, message, cmd, code, loopnum, actualpanellink, focused, requiredapifocus) {
  if (loopnum + 1 < code.length) {
    //setTimeout(() => {
      customCommands(client, message, cmd, code, loopnum + 1, actualpanellink, focused, requiredapifocus)
    //}, 1);
  }
}
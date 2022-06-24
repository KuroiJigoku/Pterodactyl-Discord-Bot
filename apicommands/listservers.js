const Discord = require("discord.js");
const request = require('request');
const settings = require("../pterosettings.json");

exports.run = (client, message, api, focused, prefix, panellink, color, footername, footerimage) => {
  request.get(panellink + '/api/client', {
    'auth': {
      'bearer': api
    }
    }, function(error, response, listserver) {
    if (response.statusCode !== 200) {
      let embed = new Discord.MessageEmbed()
        .setAuthor("An error has occured.")
        .setColor(color)
        .setDescription("Your API code might be invalid!")
        .setFooter(footername, footerimage)
      message.channel.send(embed);
      return;
    } else {
      let embed = new Discord.MessageEmbed()
        .setColor(color)
        .setFooter(footername, footerimage)
      if (settings.disableembedlinks == 1) {
        embed.setAuthor(`Your Servers`)
      } else {
        embed.setAuthor(`Your Servers`, null, panellink)
      }
      let lsa = JSON.parse(listserver);
      loopnum = 0
      maxram = []
      maxdisk = []
      relation = []
      link = []
      while (loopnum < lsa.data.length) {
        if (lsa.data[loopnum].attributes.limits.memory == 0 && settings.zerorammsg !== null) {
          maxram[loopnum] = settings.zerorammsg
        } else {
          maxram[loopnum] = lsa.data[loopnum].attributes.limits.memory + "MB"
        }
        if (lsa.data[loopnum].attributes.limits.disk == 0 && settings.zerodiskmsg !== null) {
          maxdisk[loopnum] = settings.zerodiskmsg
        } else {
          maxdisk[loopnum] = lsa.data[loopnum].attributes.limits.disk + "MB"
        }
        if (lsa.data[loopnum].attributes.server_owner == true) {
          relation[loopnum] = "Owner"
        } else {
          relation[loopnum] = "Subuser"
        }
        if (settings.disableembedlinks !== 1) {
          link[loopnum] = "**Link**: " + panellink + "/server/" + lsa.data[loopnum].attributes.identifier + "\n"
        } else {
          link[loopnum] = ""
        }
        embed.addField(lsa.data[loopnum].attributes.name, link[loopnum] + "**ID**: `" + settings.beforeidmsg + lsa.data[loopnum].attributes.identifier + "`\n**Relation**: " + relation[loopnum] + "\n```RAM: " + maxram[loopnum] + "\nDisk: " + maxdisk[loopnum] + "\n```", true)
        loopnum = loopnum + 1;
      }
      if (lsa.data.length == 0) {
        embed.setDescription('You do not own any servers.');
      }
      message.channel.send(embed);
      return;
    }
  });
}
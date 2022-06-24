const Discord = require("discord.js");
const request = require('request');
const settings = require("../pterosettings.json");

exports.run = (client, message, api, focused, prefix, panellink, color, footername, footerimage) => {
  if (focused !== "none") {
    if (message.content.toLowerCase() === prefix + "power") {
      let embed = new Discord.MessageEmbed()
        .setAuthor("Invalid usage.")
        .setColor(color)
        .setDescription("Please use `" + prefix + "power <start/stop/restart/kill>` instead.")
        .setFooter(footername, footerimage)
      message.channel.send(embed);
      return
    }
    
    type = message.content.toLowerCase().slice(6 + prefix.length)
    
    if (type == "start" || type == "stop" || type == "restart" || type == "kill") {} else {
      let embed = new Discord.MessageEmbed()
        .setAuthor("Invalid power signal.")
        .setColor(color)
        .setDescription("Please use `" + prefix + "power <start/stop/restart/kill>` instead.")
        .setFooter(footername, footerimage)
      message.channel.send(embed);
      return
    }

    if (settings.checkpower == 1) {
      request.get(panellink + '/api/client/servers/' + focused + "/utilization", {
      'auth': {
        'bearer': api
      }
      }, function(error, response, serverextra) {
        if (response.statusCode !== 200) {
          let embed = new Discord.MessageEmbed()
            .setAuthor("An error has occured.")
            .setColor(color)
            .setDescription("Your API code or/and focused server might be invalid!")
            .setFooter(footername, footerimage)
          message.channel.send(embed);
          return;
        } else {
          let sea = JSON.parse(serverextra);
          status = sea.attributes.state;
          if (status == "on" || status == "starting") {
            if (type == "start") {
              let embed = new Discord.MessageEmbed()
                .setAuthor("Already " + status + "!")
                .setColor(color)
                .setDescription("The server is already " + status + ".")
                .setFooter(footername, footerimage)
              message.channel.send(embed);
              return;
            } else {
              powerOn(client, message, panellink, focused, api, color, settings.checkpower)
            }
          } else if (status == "stopping" || status == "off") {
            if (type == "stop" || type == "kill" && status == "off") {
              let embed = new Discord.MessageEmbed()
                .setAuthor("Already " + status + "!")
                .setColor(color)
                .setDescription("The server is already " + status + ".")
                .setFooter(footername, footerimage)
              message.channel.send(embed);
              return;
            } else if (type == "restart") {
              let embed = new Discord.MessageEmbed()
                .setAuthor("Server is " + status + "!")
                .setColor(color)
                .setDescription("Do you mean to `" + prefix + "power start` instead?")
                .setFooter(footername, footerimage)
              message.channel.send(embed);
              return;
            } else {
              powerOn(client, message, panellink, focused, api, color, settings.checkpower)
            }
          }
        }
      })
    } else {
      powerOn(client, message, panellink, focused, api, color, settings.checkpower)
    }
  } else {
    let embed = new Discord.MessageEmbed()
      .setAuthor("You must focus a server!")
      .setColor(color)
      .setDescription("You must set your focused server using the `" + prefix + "focus` command before running this command.")
      .setFooter(footername, footerimage)
    message.channel.send(embed);
    return
  }
}

function powerOn(client, message, panellink, focused, api, color, checkpower) {
  request.post(panellink + '/api/client/servers/' + focused + '/power', {
    headers: {'content-type': 'application/json'},
    'auth': {
      'bearer': api
    },
    body: `{ "signal": "${type}" }`
    }, function(error, response, test) {
    if (response.statusCode !== 204) {
      let embed = new Discord.MessageEmbed()
        .setAuthor("An error has occured.")
        .setColor(color)
        .setDescription("Your API code or/and focused server might be invalid!")
        .setFooter(settings.footername, settings.footerimage)
      message.channel.send(embed);
      return;
    } else {
      type = type.replace("stop", "stopp")
      if (checkpower == 1) {
        add = ""
      } else {
        add = ", if not already"
      }
      let embed = new Discord.MessageEmbed()
        .setAuthor("Success!")
        .setColor(color)
        .setDescription(`Successfully ${type}ed the server${add}.`)
        .setFooter(settings.footername, settings.footerimage)
      message.channel.send(embed);
      return;
    }
  });
}
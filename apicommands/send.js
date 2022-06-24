const Discord = require("discord.js");
const request = require('request');
const settings = require("../pterosettings.json");

exports.run = (client, message, api, focused, prefix, panellink, color, footername, footerimage) => {
  if (focused !== "none") {
    if (message.content.toLowerCase() === prefix + "send") {
      let embed = new Discord.MessageEmbed()
        .setAuthor("Invalid usage.")
        .setColor(color)
        .setDescription("Please use `" + prefix + "send <command>` instead.")
        .setFooter(footername, footerimage)
      message.channel.send(embed);
      return
    }
    
    if (settings.checksend == 1) {
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
          if (status == "stopping" || status == "off") {
            let embed = new Discord.MessageEmbed()
              .setAuthor("Server is off")
              .setColor(color)
              .setDescription(`You cannot run commands when the server is off.\nDid you mean to run \`${prefix}power start\`?`)
              .setFooter(footername, footerimage)
            message.channel.send(embed);
            return;
          } else {
            powerOn(client, message, panellink, focused, api, color, prefix, settings.checksend)
          }
        }
      })
    } else {
      powerOn(client, message, panellink, focused, api, color, prefix, settings.checksend)
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

function powerOn(client, message, panellink, focused, api, color, prefix, checksend) {
  let runcommand = message.content.toLowerCase().slice(5 + prefix.length).replace(/"/g, '\\"')
    
  request.post(panellink + '/api/client/servers/' + focused + '/command', {
    headers: {'content-type': 'application/json'},
    'auth': {
      'bearer': api
    },
    body: `{ "command": "${runcommand}" }`
  }, function(error, response, test) {
    if (response.statusCode !== 204) {
      if (checksend == 1) {
        add = ""
      } else {
        add = " or your server is off"
      }
      let embed = new Discord.MessageEmbed()
        .setAuthor("An error has occured.")
        .setColor(color)
        .setDescription(`Your API code or/and focused server might be invalid${add}!`)
        .setFooter(settings.footername, settings.footerimage)
      message.channel.send(embed);
      return;
    } else {
      let embed = new Discord.MessageEmbed()
        .setAuthor("Success!")
        .setColor(color)
        .setDescription(`Successfully ran the command on the server.`)
        .setFooter(settings.footername, settings.footerimage)
      message.channel.send(embed);
      return;
    }
  });
}
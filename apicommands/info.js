const Discord = require("discord.js");
const request = require('request');
const settings = require("../pterosettings.json");

exports.run = (client, message, api, focused, prefix, panellink, color, footername, footerimage) => {
  if (focused !== "none") {
    request.get(panellink + '/api/client/servers/' + focused, {
    'auth': {
      'bearer': api
    }
    }, function(error, response, serverinfo) {
    if (response.statusCode !== 200) {
      let embed = new Discord.MessageEmbed()
        .setAuthor("An error has occured.")
        .setColor(color)
        .setDescription("Your API code or/and focused server might be invalid!")
        .setFooter(footername, footerimage)
      message.channel.send(embed);
      return;
    } else {
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
          status = sea.attributes.state.slice(0, 1).toUpperCase() + sea.attributes.state.slice(1)
          if (status.slice(status.length - 3) == "ing") status = status + "..."
          let currentram = sea.attributes.memory.current
          let currentcpu = Math.round(sea.attributes.cpu.current)
          let currentdisk = sea.attributes.disk.current
          let sia = JSON.parse(serverinfo);
          let servername = sia.attributes.name;
          let ram = sia.attributes.limits.memory;
          if (sia.attributes.server_owner == true) {
            relation = "Owner"
          } else {
            relation = "Subuser"
          }
          if (ram == "0" && settings.zerorammsg !== null) {
            rammsg = settings.zerorammsg;
          } else {
            rammsg = ram + "MB";
          }
          let disk = sia.attributes.limits.disk;
          if (disk == "0" && settings.zerodiskmsg !== null) {
            diskmsg = settings.zerodiskmsg;
          } else {
            diskmsg = disk + "MB";
          }
          //let cpu = sia.attributes.limits.cpu;
          let databases = sia.attributes.feature_limits.databases;
          let allocations = sia.attributes.feature_limits.allocations;
          if (settings.cputype == 1 || settings.cputype == 2) {
            if (settings.cputype == 1) {
             cputype = "vCores"
            } else {
             cputype = "Cores"
            }
            let cpu = sia.attributes.limits.cpu;
            cpuamount = Math.round(cpu/100)
          } else {
            cputype = "CPU"
            cpuamount = currentcpu + "%" // + "/" + cpu + "%"
          }
          let embed = new Discord.MessageEmbed()
            .setColor(color)
            .setDescription("**Server Name**: " + servername
              + "\n**Status**: " + status
              + "\n**Relation**: " + relation
              + "\n**RAM**: " + currentram + "MB/" + rammsg
              + "\n**Disk**: " + currentdisk + "MB/" + diskmsg
              + `\n**${cputype}**: ` + cpuamount
              + "\n**Databases**: " + databases
              + "\n**Allocations**: " + allocations)
            .setFooter(footername, footerimage)
          if (settings.disableembedlinks == 1) {
            embed.setAuthor("Server Info | " + settings.beforeidmsg + focused)
          } else {
            embed.setAuthor("Server Info | " + settings.beforeidmsg + focused, null, panellink + "/server/" + focused)
          }
          message.channel.send(embed);
          return;
        }
      });
    }
  });
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
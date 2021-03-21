
var request = require("request");
var cheerio = require("cheerio");

//-------------------------------------------------------
// This function was copied from https://github.com/valish/sherdog-api/blob/master/lib/sherdog/index.js

//  Get Fighter Profile Data
//  ufc.getFighter(url, callback(data));
//-------------------------------------------------------+

module.exports.getFighter = function (url, callback) {
    request(url, function (error, response, html) {
        if (error)
            console.error("sherodg scraper ERROR", error);
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(html);

            var fighter = {
                name: "",
                nickname: "",
                fullname: "",
                hometown: "",
                association: "",
                age: "",
                height: "",
                height_cm: "",
                weight: "",
                weight_kg: "",
                record: "",
                summary: [],
                image: "",
                fightHistory: [],
                recentYears: [],
                wins: [],
                losses: [],
                nc: [],
                strikes: {
                    attempted: 0,
                    successful: 0,
                    standing: 0,
                    clinch: 0,
                    ground: 0
                },
                takedowns: {
                    attempted: 0,
                    successful: 0,
                    submissions: 0,
                    passes: 0,
                    sweeps: 0
                },
                fights: []
            };

            // Name
            $('.bio_fighter .fn').filter(function () {
                var el = $(this);
                name = el.text();
                fighter.name = name;
            });

            // Nickname
            $('.bio_fighter .nickname').filter(function () {
                var el = $(this);
                nickname = el.text().replace('"', '');
                fighter.nickname = nickname;
            });

            // Fullname
            $('head title').filter(function () {
                var el = $(this);
                fullname = el.text().split("MMA Stats")[0];
                fighter.fullname = fullname;
            });

            //Image
            $('.profile_image').filter(function () {
                var el = $(this);
                image = el.attr("src");
                fighter.image = image;
            });


            // Hometown
            $('.adr span').filter(function () {
                var el = $(this);
                hometown = el.text().replace(/[\n\t]/g, "");
                fighter.hometown = hometown;
            });
            $('.adr strong').filter(function () {
                var el = $(this);
                country = el.text();
                fighter.hometown += " " + country;
            });

            // Association
            $('.association > span').filter(function () {
                var el = $(this);
                association = el.text();
                fighter.association = association;
            });

            // Age
            $('.birthday strong').filter(function () {
                var el = $(this);
                age = el.text().replace("AGE:", "").trim();
                fighter.age = age;
            });

            // Height
            $('.item.height').filter(function () {
                var el = $(this);
                height = el.text().trim().split("\n")[1].trim();
                height_cm = el.text().trim().split("\n")[2].trim().replace("cm", "").trim();
                fighter.height = height;
                fighter.height_cm = Math.round(height_cm);
            });

            // Weight
            $('.item.weight').filter(function () {
                var el = $(this);
                weight = el.text().trim().split("\n")[1].trim();
                weight_kg = el.text().trim().split("\n")[2].trim().replace("kg", "").trim();
                fighter.weight = weight;
                fighter.weight_kg = Math.round(weight_kg);
            });

            // Record
            $('td#fighter-skill-record').filter(function () {
                var el = $(this);
                record = el.text();
                fighter.record = record;
            });


            // Summary
            // $('td#fighter-skill-summary').filter(function () {
            //     var el = $(this);
            //     summary = el.text().split(", ");
            //     fighter.summary = summary;
            // });

            $('.fight_history tr').each(function (i, el) {
                //each td is one fight

                el = $(el);
                var result = el.find('td .final_result').text();
                if (!result) {
                    return true; //skip this iteration, not a valid fight TD
                }

                var $opponentAnchorEl = $(el.find('td')[1]).find("a");
                var opponentName = $opponentAnchorEl.text();
                var opponentUrl = $opponentAnchorEl.attr("href");
                var eventName = $(el.find('td')[2]).find("a").text();
                var dateString = $(el.find('td')[2]).find(".sub_line").text(); //sherdog date format: "Mar / 04 / 2017"
                var year = dateString.split("/")[2].trim();
                var date = new Date(dateString); //yes, JS can parse sherdogs format to a dateobject
                var dateJson = JSON.stringify(date);
                var method = $(el.find('td')[3]).text();
                method = method.indexOf(")") > -1 ? method.split(")")[0] + ")" : method;
                var round = $(el.find('td')[4]).text();
                var time = $(el.find('td')[5]).text();

                var fightObject = {
                    year,
                    date,
                    dateJson,
                    dateString,
                    result,
                    method,
                    opponentName,
                    opponentUrl,
                    opponentUrl,
                    eventName,
                    round,
                    time
                };

                fighter.fightHistory.push(fightObject);
                if (fightObject.result === "win")
                    fighter.wins.push(fightObject);
                else if (fightObject.result === "loss")
                    fighter.losses.push(fightObject);
                else
                    fighter.nc.push(fightObject);
            });

            //Analyze fighter history and find some interesting stats
            var recentYears = [];
            const now = new Date();
            const dateLimit = now.setYear(now.getYear() - 5);
            fighter.fightHistory.forEach(function (item, index) {
                if (item.date - dateLimit > 0) {
                    var roundString = item.method.indexOf("Decision") > -1 ? "" : ", round " + item.round;
                    var way = " [" + item.method + roundString + "]";
                    fighter.recentYears.push(item.year + ": " + item.result + " vs " + item.opponentName + way);
                }
            });

            // Striking Metrics
            $('#fight-history .overall-stats').first().filter(function () {
                var el = $(this);
                var stAttempted = el.find('.graph').first();
                var stSuccessful = el.find('.graph#types-of-successful-strikes-graph');
                strikes_attempted = parseInt(stAttempted.find('.max-number').text());
                strikes_successful = parseInt(stAttempted.find('#total-takedowns-number').text());
                strikes_standing = parseInt(stSuccessful.find('.text-bar').first().text());
                strikes_clinch = parseInt(stSuccessful.find('.text-bar').first().next().text());
                strikes_ground = parseInt(stSuccessful.find('.text-bar').first().next().next().text());
                fighter.strikes.attempted = strikes_attempted;
                fighter.strikes.successful = strikes_successful;
                fighter.strikes.standing = strikes_standing;
                fighter.strikes.clinch = strikes_clinch;
                fighter.strikes.ground = strikes_ground;
            });

            // Grappling Metrics
            $('#fight-history .overall-stats').first().next().filter(function () {
                var el = $(this);
                var tdAttempted = el.find('.graph').first();
                var tdSuccessful = el.find('.graph#grappling-totals-by-type-graph');
                takedowns_attempted = parseInt(tdAttempted.find('.max-number').text());
                takedowns_successful = parseInt(tdAttempted.find('#total-takedowns-number').text());
                takedowns_submissions = parseInt(tdSuccessful.find('.text-bar').first().text());
                takedowns_passes = parseInt(tdSuccessful.find('.text-bar').first().next().text());
                takedowns_sweeps = parseInt(tdSuccessful.find('.text-bar').first().next().next().text());
                fighter.takedowns.attempted = takedowns_attempted;
                fighter.takedowns.successful = takedowns_successful;
                fighter.takedowns.submissions = takedowns_submissions;
                fighter.takedowns.passes = takedowns_passes;
                fighter.takedowns.sweeps = takedowns_sweeps;
            });

            callback(fighter);
        }
    });
}

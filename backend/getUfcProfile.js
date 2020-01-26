function getUFCProfile() {

    //------------------------------------------+
    //  Crawl and Parse Sherdog Profile
    //  https://github.com/valish/sherdog-api
    //------------------------------------------+

    // Search for UFC profile
    // google(query + ' ufc', function (err, next, links) {
    //   if (err) console.error(err);

    //   for (var i = 0; i < links.length; ++i) {
    //     if (resultContains(links[i], "ufc.com/fighter/")) {
    //       ufc_url = links[i].href;
    //       i = 10;
    //     }
    //   }

    //   //------------------------------------------+
    //   //  Crawl and Parse UFC Profile
    //   //  https://github.com/valish/ufc-api
    //   //------------------------------------------+
    //   if (ufc_url) {
    //     ufc.getFighter(ufc_url, function (data) {
    //       fighter.fullname = data.fullname;
    //       fighter.hometown = data.hometown;
    //       fighter.location = data.location;
    //       fighter.height = data.height;
    //       fighter.height_cm = data.height_cm;
    //       fighter.weight = data.weight;
    //       fighter.weight_kg = data.weight_kg;
    //       fighter.record = data.record;
    //       fighter.college = data.college;
    //       fighter.degree = data.degree;
    //       fighter.summary = data.summary;
    //       fighter.strikes = data.strikes;
    //       fighter.takedowns = data.takedowns;

    //       callback(fighter);
    //     });
    //   } else {
    //     callback(fighter);
    //   }
    // });
}

const Crawler = require("crawler");
const fs = require('fs');

let url = 'https://perm.cian.ru/cat.php?deal_type=sale&engine_version=2&floornl=1&is_first_floor=0&max_house_year=2017&maxtarea=80&min_house_year=2000&offer_type=flat&region=4927&room2=1&totime=2592000&wp=1';
let pages = encodeURIComponent(process.argv[2]);
let queue = [];
let apartmentArray = [];
let count = 1;
let countPages = 1;
let handle = function($, isLast = false) {
    let midCosts = $(".c6e8ba5398-term--39cia").text();
    let adresses = $(".c6e8ba5398-address-links--1I9u5").text();
    let midCostsArray = midCosts.split(' ₽/м²').map(cost => {
        return cost.split(' ').join('');
    })
    let adressArray = adresses.split('Пермский край, Пермь, ').map(adress => {
        return adress.split(',')[0];
    })
    midCostsArray.pop();
    adressArray.shift();
    for (let i = 0; i < midCostsArray.length; i++) {
        apartmentArray.push({ count: count++, cost: midCostsArray[i], district: adressArray[i] });
    }
    console.log(countPages++ + ' / ' + pages);
    if (isLast) {
        console.log(apartmentArray);
        fs.writeFileSync('output-' + Date.now() + '.json', JSON.stringify(apartmentArray, null, 4));
    }
}

let c = new Crawler({
    maxConnections : 10,
    rateLimit: 100,
    // This will be called for each crawled page
    callback : function (error, res, done) {
        if(error) {
            console.log(error);
        } else{
            let $ = res.$;
            // $ is Cheerio by default
            //a lean implementation of core jQuery designed specifically for the server
            handle($)
        }
        done();
    }
});

// Queue just one URL, with default callback
for (let i = 1; i <= pages; i++) {
    if (i == pages) { 
        queue.push({
            uri: `${url}&p=${i}`,
            callback: function (error, res, done) {
                if(error){
                    console.log(error);
                }else{
                    let $ = res.$;
                    handle($, true);
                }
                done();
            }
        }); 
    } else {
        queue.push(`${url}&p=${i}`); 
    }
}
c.queue(queue);

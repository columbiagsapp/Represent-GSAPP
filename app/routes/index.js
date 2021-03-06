'use strict';

// GLOBALS

var programs_path = '/var/www/represent.gsapp.org/public_html/Represent-GSAPP/app/programs.json';

// END GLOBALS


/////// DEPENDENCIES
var colors  = require('colors');
console.log('images.js entered'.cyan);

var fs = require('fs');

// Images routes use images controller
var Images = require('../controllers/images');

var statsTest = require('../../test/stats');

var programs = require('../programs');

/////// END DEPENDENCIES

// pulls in programs.json as a reset
var resetPrograms = function(){
  console.log('reload programs');
  delete require.cache[require.resolve('../programs')];
  programs = require('../programs');
  console.dir(programs);
};



// routes
exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.landing = function(req, res){
  res.render('landing', { title: 'Represent GSAPP', programs: programs });
};

exports.home = function(req, res){
  resetPrograms();

  res.render('home', { title: 'Represent GSAPP', programs: programs });
};

exports.statsTest = function(req, res){
  res.json(statsTest);
};

exports.fetch = function(req, res){
  console.log('fetch()');

  Images.fetchByHashtag(req, res, 'repgsapp');

};

// render the carousel
exports.grid = function(req, res){
  console.log('/grid');
  var images = Images.renderAll(req, res, 'grid');
};

// render the carousel
exports.edit = function(req, res){
  console.log('/edit');
  var images = Images.renderAll(req, res, 'edit');
};


exports.stats = function(req, res){
  console.log('/api/stats');
  Images.renderStats(req, res);
}

exports.programs = function(req, res){
  console.log('/programs');
  res.render('programs', { programs: programs });
}




exports.editPublished = function(req, res){
  console.log('/edit/published');
  var images = Images.edit(req, res, 'published');
};

exports.editPending = function(req, res){
  console.log('/edit/pending');
  var images = Images.edit(req, res, 'pending');
};

exports.editHidden = function(req, res){
  console.log('/edit/hidden');
  var images = Images.edit(req, res, 'hidden');
};

exports.editFeatured = function(req, res){
  console.log('/edit/featured');
  var images = Images.edit(req, res, 'featured');
};





// api

exports.publish = function(req, res){
  console.log('/api/publish');
  var images = Images.setStatus(req, res, req.body.publish, 'published');
};

exports.pend = function(req, res){
  console.log('/api/pend');
  var images = Images.setStatus(req, res, req.body.pend, 'pending');
};

exports.hide = function(req, res){
  console.log('/api/hide');
  var images = Images.setStatus(req, res, req.body.hide, 'hidden');
};

exports.feature = function(req, res){
  console.log('/api/feature');
  var images = Images.setStatus(req, res, req.body.feature, 'featured');
};

exports.update = function(req, res){
  console.log('/api/update');
  var images = Images.update(req, res);
};

exports.getByProgram = function(req, res){
  var images = Images.getByProgram(req, res);
};

exports.getPrograms = function(req, res){
  res.json(programs);
};

exports.getFeatured = function(req, res){
  Images.getFeatured(req, res);
};

// update the programs.json file with new programs
exports.updatePrograms = function(req, res){
  console.log('new_programs:');

  var new_programs = req.body.programs;
  if(req.body.newprogram != ""){
    new_programs.push( req.body.newprogram.toLowerCase() );
  }

  console.dir(new_programs);

  //write to disc
  fs.writeFile(programs_path, JSON.stringify(new_programs), function(err) {
    if(err) {
        console.log('Error: attempting to write programs.json to disc:' + err);
        res.send(500);
    } else {
        console.log("The file was saved!");
        programs = new_programs;
        Images.resetPrograms();

        res.redirect(req.get('referer'));
    }
  });
};


/*


/////// INSTAGRAM
var ig = require('instagram-node').instagram();

//import Instagram secrets from json file
var instagram_secrets = require('../secrets.json').instagram;

//set up secrets for Instagram module
ig.use({ client_id: instagram_secrets.client_id,
    client_secret: instagram_secrets.client_secret });
/////// END INSTAGRAM





/////// GLOBALS
var fetched_array; //container array for all fetched Instagram images

var tags = []; //array to hold tags for all programs (eg. xrio, xbeirut)
var tag_index = 0; //counter: current city fetching from Instagram by index in tags[] array
var total_found = 0; //counter: total images found from Instagram for given city
var current_program = ''; //pointer: current city fetching from Instagram

var interval_id; //global ID for the main interval for fetching from Instagram

var FETCH_TIME = 3000; //fetch every 3 seconds
var FETCHING_FROM_INSTAGRAM_BUSY_FLAG = false; //flag if in the middle of fetching
var DOWNLOADING_FROM_INSTAGRAM_BUSY_FLAG = false; //flag if in the middle of downloading
/////// END GLOBALS

/////// HELPER FUNCTIONS
function pushArray(arr, arr2) {
    arr.push.apply(arr, arr2);
}
/////// END HELPER FUNCTIONS


/////// INITIALIZE programs ARRAY
//pull in array of programs from json file
var programs = require('../programs.json');

/////// END INITIALIZE programs ARRAY


//Initializes downloading all undownloaded images from Instagram
function initImageDownloadCycle(){
    images.downloadAll();
}


//Initializes fetching all images from Instagram and puts them in the database
//to be later downloaded then uploaded to Flickr
function initInstagramFetchCycle(){

    FETCHING_FROM_INSTAGRAM_BUSY_FLAG = true;

    fetched_array = []; //clear out container array for all fetched Instagram images
    tag_index = 0;

    current_program = tags[tag_index].substring(1);

    //start to fetch from Instagram
    fetchAllProgramsFromInstagram();
}






var instagram_handler = function(err, medias, pagination, limit) {
    if(err){
        console.log(err);
    }else{
        console.log('\nFetched ' + medias.length + ' images'.cyan + ' from tag_index: ' + tag_index + ' = city: ' + tags[tag_index] + ' with limit: ' + limit + ' and pagination:');
        console.dir(pagination);

        for(var m = 0; m < medias.length; m++){
            //set city for all fetched items
            medias[m].city = tags[tag_index].substring(1);
        }

        pushArray(fetched_array, medias);

        if(pagination.next){
            console.log('\nPAGINATION.NEXT()\n');
            pagination.next(instagram_handler);

        //no pagination, move on to next city
        }else{

            if(tag_index >= (tags.length - 1) ){ //if just finished the last city
                //report out totals
                console.log('\n\nfetched_array.length: ' + fetched_array.length); //total in fetched_array
                var all_images = images.all(); //total in database

                //set and clear state flags
                FETCHING_FROM_INSTAGRAM_BUSY_FLAG = false;
                DOWNLOADING_FROM_INSTAGRAM_BUSY_FLAG = true;

                ////all images have been fetched, start to upsert all images recursively
                //call: upsert from controllers > images
                //callback: start to download image binaries from Instagram
                images.upsertArray(fetched_array, initImageDownloadCycle);

            }else{
                console.log('\n\nmoving on to the next city\n\n');
                tag_index++; //increment city

                //iterate
                ig.tag_media_recent(tags[tag_index], instagram_handler);
            }
        }
    }
};



function fetchAllProgramsFromInstagram(){
    var images_array = [];

    console.log('searching for tag: ' + tags[tag_index]);
    console.log('tag_index: ' + tag_index);
    console.dir(tags);

    ig.tag_media_recent(tags[tag_index], instagram_handler);

}



//initInstagramFetchCycle();



module.exports = function(app) {

    app.get('/fetch', function(req, res){
        initInstagramFetchCycle();
    });

    app.all ('/callback', function(req, res){
        console.log('\n\n\nreq:');
        console.dir(req);
        console.log('\n\n\nres:');
        console.dir(res);
    });

    /*
    app.post('/articles', authorization.requiresLogin, articles.create);
    app.get('/articles/:articleId', articles.show);
    app.put('/articles/:articleId', authorization.requiresLogin, hasAuthorization, articles.update);
    app.del('/articles/:articleId', authorization.requiresLogin, hasAuthorization, articles.destroy);

    // Finish with setting up the articleId param
    app.param('articleId', articles.article);
    */

//};

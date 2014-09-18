'use strict';

/////// GLOBALS
var image_files_directory = "/var/www/x-gram.gsapp.org/public_html/public/img/instagram/";
var image_files_extension = ".jpg";

var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

var media_buffer = []; //container array for all fetched Instagram images

var FETCH_TIME = 3000; //fetch every 3 seconds
var FETCHING_FROM_INSTAGRAM_BUSY_FLAG = false; //flag if in the middle of fetching
var DOWNLOADING_FROM_INSTAGRAM_BUSY_FLAG = false; //flag if in the middle of downloading
/////// END GLOBALS

/////// HELPER FUNCTIONS
function pushArray(arr, arr2) {
    arr.push.apply(arr, arr2);
}
/////// END HELPER FUNCTIONS

var mongoose = require('mongoose'),
	fs = require('fs');
  //request = require('request'),
  //_ = require('lodash');

var programs = require('../programs');

// load image model schema
require('../models/image');
var Image = mongoose.model('Image');


/////// INSTAGRAM
var ig = require('instagram-node').instagram();

//import Instagram secrets from json file
var instagram_secrets = require('../secrets.json').instagram;

//set up secrets for Instagram module
ig.use({ client_id: instagram_secrets.client_id,
    client_secret: instagram_secrets.client_secret });
/////// END INSTAGRAM








// test function
exports.test = function(req, res){
  console.log('controllers/images::test()');
  res.send(200);
};







// fetch from Instagram API
exports.fetchByHashtag = function(req, res, tag){
  console.log('searching for tag: ' + tag);

  ig.tag_media_recent(tag, instagram_fetch_handler);

  res.redirect('/edit');
};





var instagram_fetch_handler = function(err, medias, pagination, limit) {
    if(err){
        console.log(err);
    }else{
        console.log('\nFetched ' + medias.length + ' images'.cyan);

        pushArray(media_buffer, medias);

        if(pagination.next && (media_buffer.length < 100)){
          console.log('\nPAGINATION.NEXT()\n');

          console.log('media_buffer.length: '+ media_buffer.length);

          pagination.next(instagram_fetch_handler);
        }else{
          // add all other information
          var clean_buffer = sanitizeArray(media_buffer);

          // store all media in media_buffer[] in db
          saveImagesInArray(clean_buffer);
        }
    }
};

// takes raw Instagram fetch data in an array and adds other data
var sanitizeArray = function(medias){
  var sanitized_array = [];
  for(var m = 0; m < medias.length; m++){
    var obj = {};
    obj.content = medias[m];
    obj.downloaded = false;
    obj.programs = extractPrograms(medias[m].tags);

    sanitized_array.push(obj);
  }

  return sanitized_array;
};

// hunts through tags for programs, return programs that are in tags as arrray in all lowercase
var extractPrograms = function(tags){
  var pgms = [];

  for(var t = 0; t < tags.length; t++){
    for(var p = 0; p < programs.length; p++){
      if(tags[t].toLowerCase() == programs[p].toLowerCase()){
        pgms.push( programs[p].toLowerCase() );
      }
    }
  }

  return pgms;
};


// save array of sanitized media to db
var saveImagesInArray = exports.addArray = function(medias){
  // passes off the recursive saving to a handler function
  saveImagesInArray_handler(medias, 0);
};


// saves all Instagram data in a sanitized array to the db
// only saves new images, skips those already in the db
var saveImagesInArray_handler = exports.saveImagesInArray = function(medias, index){

  // flag to avoid saving the same images again
  var already_in_db = false;

  // hunt for images already in the db
  Image.findOne({ 'content.id': medias[index].content.id}, function(err, image) {
    if (err){
      console.log('saveImagesInArray_handler()::error attempting to get image by instagram id with msg: ' + err);
    }else{
      // don't save it again if already in db
      if(image != null){
        already_in_db = true;

        // recursion
        index++;
        if(index < medias.length){
          saveImagesInArray_handler(medias, index);
        }else{
          console.log('finished saving*******');
        }
      }else{
        // not in db, so save the image
        var image = new Image();

        image.content = medias[index].content;
        image.programs = medias[index].programs;
        image.downloaded = medias[index].downloaded;
        image.visible = true;

        image.save(function(err) {
          if (err) {
            console.log('saveImagesInArray_handler()::error attempting to save new image');
          } else {
            // recursion
            index++;
            if(index < medias.length){
              saveImagesInArray_handler(medias, index);
            }else{
              console.log('finished saving*******');
            }
          }
        });
      }
    }
  });
};// end saveImagesInArray_handler()





// render all images through the grid view
exports.renderAll = function(req, res){
  Image.find({ 'visible': true }).exec(function(err, images) {
    if(err){
      console.log('getAll()::error finding all images: '+ err);
      res.send(500);
    }else{
      console.log('images[0].content.images.standard_resolution');
      console.dir(images[0].content.images.standard_resolution.url);

      res.render('grid', { images: images, programs: programs });
    }
  });
};


// render all images through the edit view
exports.editAll = function(req, res){
  Image.find({ 'visible': true }).exec(function(err, images) {
    if(err){
      console.log('getAll()::error finding all images: '+ err);
      res.send(500);
    }else{

      res.render('edit', { images: images });
    }
  });
};


// sets the visible flag to false
exports.editDelete = function(req, res){

  console.log('req.body.delete: ' + req.body.delete);
  var id = req.body.delete;

  Image.findOne({ '_id': id}, function(err, image) {
    if(err){
      console.log('getAll()::error finding all images: '+ err);
      res.send(500, 'image not deleted, server error');
    }else{

      image.visible = false;

      image.save(function(err) {
        if (err) {
          console.log('editDelete()::error attempting to save invisible image');
          res.send(500, 'image not deleted, server error on save attempt');
        } else {
          res.redirect('/edit');
        }
      });// end save

    }//end else no error
  });//end findOne
}


// return all images of a certain program














//////// OLD



/**
 * Find image by id
 */
exports.image = function(req, res, next, id) {
    Image.load(id, function(err, image) {
        if (err) return next(err);
        if (!image) return next(new Error('Failed to load image ' + id));
        req.image = image;
        next();
    });
};

/**
 * Get an image by id
*/
exports.get = function(id){
	Image.load(id, function(err, image) {
        if (err){
        	console.log('error attempting to get image: ' + err);
        	return null;
        }else if (!image){
        	//console.log('No image with id: ' + id);
        	return null;
        }else{
        	//console.log('got image');
        	return image;
        }
    });
};

exports.getByInstagramID = function(iid){
	Image.findOne({ instagram_id: iid}, function(err, image) {
        if (err){
        	console.log('error attempting to get image by instagram_id with msg: ' + err);
        	return null;
        }else if (!image){
        	//console.log('No image with instagram_id: ' + iid);
        	return null;
        }else{
        	//console.log('got image by instagram_id');
        	return image;
        }
    });
};


// returns true if image is clean, otherwise returns false
function isImageCorrupt(img){
	//check for required fields
	if( !img.created_time ) return false;
	if( !img.user.username ) return false;
	if( !img.link ) return false;
	if( !img.images.standard_resolution.url ) return false;
	if( !img.id ) return false;

	//all checks passed
	return true;
};


var upsertArrayHandlerRecursive = function(imgs, idx, next){

	console.log('idx: ' + idx);
	console.log('imgs.length: ' + imgs.length);

	if(idx >= imgs.length){
		next();
	}else{

		Image.findOne({ instagram_id: imgs[idx].id }, function(err, image) {
	        if (err){
	        	console.log('error attempting to get image by instagram_id with msg: ' + err);
	        	return null;
	        }else if (!image){
	        	console.log('No image with instagram_id: ' + imgs[idx].id + ' so we\'re creating it');

	        	var upsert_image = imgs[idx];

	        	if( isImageCorrupt(upsert_image) ){

					var image = new Image();

					//instagram ID: will check against this later for duplicates
					image.instagram_id = upsert_image.id;

					image.created_time = upsert_image.created_time;
					image.username = upsert_image.user.username;
					image.fullname = upsert_image.user.full_name;
					image.image_url = upsert_image.images.standard_resolution.url;
					image.link = upsert_image.link;

					image.caption = (upsert_image.caption) ? upsert_image.caption.text : "";

					image.latitude = (upsert_image.location) ? upsert_image.location.latitude : null;
					image.longitude = (upsert_image.location) ? upsert_image.location.longitude : null;

					//additional fields, may use later
					image.filter = upsert_image.filter;
					image.user_website = (upsert_image.user.website) ? upsert_image.user.website : null;

					image.tags = upsert_image.tags;


					//set flags for later downloading from Instagram and uploading to Flickr
					image.downloaded = false;
					image.uploaded = false;
					image.added_to_flickr_set = false;

					//set the city based on the hashtag
					image.city = (upsert_image.city) ? upsert_image.city : "";

					//save the image to the database
				    image.save(function(err) {
				        if (err) {
				        	console.log('error attempting to save image');
				        } else {
				        	console.log('created new image');
				        	idx++;//increment index
				        	upsertArrayHandlerRecursive(imgs, idx, next); //run recursively on the next image
				        }
				    });
				//end if image is corrupted
				}else{
					console.log('******* IMAGE FLAWED skipping to next *******');
			    	idx++;//increment index
			    	upsertArrayHandlerRecursive(imgs, idx, next); //run recursively on the next image
				}

			//end if image already exists
	        }else{
	        	console.log('image already exists, don\'t create');
	        	idx++;//increment index
			    upsertArrayHandlerRecursive(imgs, idx, next); //run recursively on the next image
	        }
	    });
	}//end if idx >= imgs.length
};

/**
 * Upsert an array of Instagram images into the database
 */
exports.upsertArray = function(imgs, next) {

	upsertArrayHandlerRecursive(imgs, 0, next);
};

/**
 * Upsert an Instagram image into the database
 */
var upsert = exports.upsert = function(upsert_image, next) {
	//check if missing key information, in which case, break
	if( isImageCorrupt(upsert_image) ){

		var image = new Image();

		//instagram ID: will check against this later for duplicates
		image.instagram_id = upsert_image.id;

		image.created_time = upsert_image.created_time;
		image.username = upsert_image.user.username;
		image.image_url = upsert_image.images.standard_resolution.url;
		image.link = upsert_image.link;

		image.caption = (upsert_image.caption) ? upsert_image.caption.text : "";

		image.latitude = (upsert_image.location) ? upsert_image.location.latitude : null;
		image.longitude = (upsert_image.location) ? upsert_image.location.longitude : null;

		//additional fields, may use later
		image.filter = upsert_image.filter;
		image.user_website = (upsert_image.user.website) ? upsert_image.user.website : null;



		//set flags for later downloading from Instagram and uploading to Flickr
		image.downloaded = false;
		image.uploaded = false;
		image.added_to_flickr_set = false;

		//set the city based on the hashtag
		image.city = (upsert_image.city) ? upsert_image.city : "";

		//save the image to the database
	    image.save(function(err) {
	        if (err) {
	        	console.log('error attempting to save image');
	        } else {
	        	console.log('created new image');
	        	idx++;//increment index
	        	next(im, idx);//run recursively on the next image
	        }
	    });
	//end if image is corrupted
	}else{
		console.log('******* IMAGE FLAWED skipping to next *******');
    	idx++;//increment index
    	next(im, idx);//run recursively on the next image
	}

};



function downloadArrayByInstagramID(images, idx, next){

	console.log('entering downloadArrayByInstagramID: ' + idx + '/' + images.length);

	if(idx < images.length){

		Image.findOne({ instagram_id: images[idx].instagram_id }, function(err, image) {
	        if (err){
	        	console.log('error attempting to downloadByInstagramID with msg: ' + err);
	        	console.log('moving on to the next'.red);
	        	idx++;
				downloadArrayByInstagramID(images, idx, next);
	        }else if (!image){
	        	console.log('downloadByInstagramID problem: no image with instagram_id: ' + images[idx].instagram_id);
	        	console.log('moving on to the next'.red);
	        	idx++;
				downloadArrayByInstagramID(images, idx, next);
	        }else{
	        	var uri = image.image_url;
	        	var filename = image_files_directory + image.instagram_id + image_files_extension;

	        	request.head(uri, function(err, res, body){
					console.log('content-type:', res.headers['content-type']);
					console.log('content-length:', res.headers['content-length']);

					//download and write the image binary to disc
					request(uri).pipe(fs.createWriteStream(filename)).on('close', function(){
						//set downloaded flag to true
						Image.update({ instagram_id: images[idx].instagram_id}, { downloaded: true }, function(err){
							if(err) console.log('error attempting to update image with download flag with msg: ' + msg);
							//callback after flag set
							idx++;
							downloadArrayByInstagramID(images, idx, next);

						});
					});
				});
	        }
	    });
	}else{
		console.log('finished downloading images');

		next(); //callback function
	}

};

exports.downloadAll = function(next){
	Image.find({ downloaded: false }).exec(function(err, images) {
        if (err) {
            console.log("error attempting to get all images for downloadAll with msg: " + msg);
        } else {
            downloadArrayByInstagramID(images, 0, next);
        }
    });
}




/**
 * Update an image
 */
exports.update = function(req, res) {
    var image = req.image;

    image = _.extend(image, req.body);

    image.save(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                image: image
            });
        } else {
            res.jsonp(image);
        }
    });
};

/**
 * Delete an image
 */
exports.destroy = function(req, res) {
    var image = req.image;

    image.remove(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                image: image
            });
        } else {
            res.jsonp(image);
        }
    });
};

/**
 * Show an image
 */
exports.show = function(req, res) {
    res.jsonp(req.image);
};

/**
 * List of Images
 */
exports.all = function(req, res) {
    Image.find().sort('-created_time').exec(function(err, images) {
        if (err) {
            console.log("error attempting to get all images with msg: " + msg);
        } else {
        	console.log('total images in database: ' + images.length);
            return images;
        }
    });
};

function uploadArrayToFlickr(images, idx, flickr_api){

    if(idx < images.length){

    	var filename = images[idx].instagram_id + image_files_extension;
        var fullpath = image_files_directory + filename;


        console.log('[idx]: ' + idx);
        console.dir(images[idx]);

        //set tags for Flickr
        var tags = [];
        tags = images[idx].tags;
        tags.push(images[idx].city);
        tags.push(images[idx].username);
        tags.push('instagram');
        tags.push( 'X-Gram2014' );
        tags.push( 'Studio-X' );
        tags.push( 'GSAPP' );
        var tagsString = tags.join(' ');

        //set date stamp for Flickr
		var unixTime = parseInt( images[idx].created_time ) * 1000;
		var d = new Date(unixTime);

		var desc;

		if(images[idx].caption != null){
        	desc = images[idx].caption + ' -- submitted ' + days[ d.getDay() ] + ', ' + months[ d.getMonth() ] + ' ' + d.getDate() + ', ' + d.getFullYear() + ' at ' + d.getHours() + ':' + d.getMinutes();
        }else{
            console.log('photo has blank caption');
            desc = '-- submitted ' + days[ d.getDay() ] + ', ' + months[ d.getMonth() ] + ' ' + d.getDate() + ', ' + d.getFullYear() + ' at ' + d.getHours() + ':' + d.getMinutes();
        }

        console.log("desc: " + desc);

        var credit = (images[idx].fullname) ? (images[idx].fullname + ' (' + images[idx].username + ')') : images[idx].username;

        console.log('credit: ' + credit);


        //build params object
        var params = {
            title: 'X-Gram 2014 submitted through instagram by ' + credit,
            description: desc,
            is_public: 1,
            is_friend: 0,
            is_family: 0,
            hidden: 2,
            content_type: 1,
            tags: tagsString,
            photo: fs.createReadStream(fullpath, {flags: 'r'})
        };




        // the method_name gets the special value of "upload" for uploads.
        flickr_api('upload', params, function(err, response) {
            if(err){
                console.error("Could not upload photo. Error message:");
                console.error(err.toString());
            }else{
                console.log('SUCCESS: uploaded photo with response:');
                console.dir(response);
                console.log('');

                Image.update({ instagram_id: images[idx].instagram_id }, { uploaded: true, flickr_id: response.photoid }, function(err, result){
                	console.log('returned from updating upload flag');
			        if (err){
			        	console.log("ERROR: trying to update database photo with _id: "+ images[idx]._id + " with flickr_id: "+ response.photoid);
				    	console.log("error message: " + err);
			        }else{
			        	console.log("SUCCESS: updated database photo with _id: "+ images[idx]._id + " with flickr_id: "+ response.photoid + " result: ");
			    		console.log(result);
			    		console.log('\n');

						flickr_api('flickr.photosets.addPhoto', {photoset_id: "72157642125547533", photo_id: response.photoid}, function(err, response2) {
		                	if(err){
		                		console.log('ERROR: Could not migrate photo with id '+ response.photoid + ' to photoset with id 72157642125547533');
		                		console.log("error message: " + err);
		                	}else{
		                		console.log('SUCCESS: migrated photo with id '+ response.photoid + ' to photoset with id 72157642125547533');
		                		console.log("response2: " + response2);

		                		Image.update({ instagram_id: images[idx].instagram_id }, { added_to_flickr_set: true }, function(err, result){
            						if(err){
            							console.log('ERROR trying to update added_to_flickr_set flag');
            							console.log('error message: ' + err);
            						}else{
	                					console.log('SUCCESS trying to update added_to_flickr_set flag');

	                					//attempt to add Geolocation
	                					if(images[idx].latitude != null){
					                		flickr_api('flickr.photos.geo.setLocation', {photo_id: response.photoid, lat: images[idx].latitude, lon: images[idx].longitude}, function(err, response3){
				                				if(err){
				                					console.log("ERROR: trying to set geolocation of photo with id "+ response.photoid + ' with lat: '+ images[idx].latitude + ' and lon: '+ images[idx].longitude);
				                					console.log("error message" + err);
				                					console.log('\n\n-------\n\n\n');

				                				}else{
				                					console.log("SUCCESS: set geolocation of photo with id "+ response.photoid + ' with lat: '+ images[idx].latitude + ' and lon: '+ images[idx].longitude);
				                					console.log(response3);
				                				}
				                				///////******* Iterate
				                				console.log('\n\n-------\n\n\n');
			                					idx++;
												uploadArrayToFlickr(images, idx, flickr_api);
					                		});//end flickr api call to set geolocation
					                	}else{
					                		///////******* Iterate
					                		console.log('\n\n-------\n\n\n');
					                		idx++;
											uploadArrayToFlickr(images, idx, flickr_api);
					                	}


            						}//end if/else in Image.update added_to_flickr_set
            					});//end Image.update added_to_flickr_set
		                	}//end if/else on flickr_api call to add photo to set
		                });//end flickr_api call to add photo to set
			        }//end if/else on Images.update(uploaded: true)
			    });//close Images.update(uploaded: true)
			}//end if/else on first API call
		});//end first api call








/*
        // the upload method is special, but this library automatically handles the
        // hostname change
        flickr_api({
            method: 'upload',
            title: 'X-Gram 2014 from ' + images[idx].username + ' in ' + images[idx].city,
            description: images[idx].caption,
            is_public: 1,
            is_friend: 0,
            is_family: 0,
            hidden: 2,
            photo: fs.createReadStream(fullpath)
        }, function(err, response) {
			if (err) {
				console.error('Could not upload photo:', err);
				console.log('continuing anyways'.red);
				idx++;
				uploadArrayToFlickr(images, idx, flickr_api);
			}else {
				var new_photo_id = response.photoid._content;
				// usually, the method name is precisely the name of the API method, as they are here:
				flickr_api({method: 'flickr.photos.getInfo', photo_id: new_photo_id}, function(err, response) {
					console.log('Full photo info:', response);
					flickr_api({method: 'flickr.photosets.addPhoto', photoset_id: 72157642125547533, photo_id: new_photo_id}, function(err, response) {
				        if(err){
				        	console.log('error adding photo to photoset');
				        	console.log('continuing anyways'.red);
				    	}else{
				    		console.log('Added photo to photoset:', response);
				    	}
				    	idx++;
						uploadArrayToFlickr(images, idx, flickr_api);
					});
				});
			}
        });
	*/
    }else{
        console.log('\n\n\n\n\n\n\nall photos finished uploading!'.cyan)
    }
}

exports.uploadAllToFlickr = function(flickr_api){
	Image.find({ downloaded: true, uploaded: false }).exec(function(err, images) {
        if (err) {
            console.log("error attempting to get all non-uploaded images for allToUpload with msg: " + msg);
        } else {
            uploadArrayToFlickr(images, 0, flickr_api);
        }
    });

};

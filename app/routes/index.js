
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.landing= function(req, res){
  res.render('landing', { title: 'Represent GSAPP' });
};

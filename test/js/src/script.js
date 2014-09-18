(function(){

	var chart = new Snap('#stats'),
		apiURL = 'stats.json', // change to URL string when API is ready
		columnWidth = 110, // might want to dynamically set this from text width
		data;

	var height = +chart.attr('height'),
		width = +chart.attr('width');

	// make sure this matches all the colors in scss/_vars.scss
	var colors = ['red', 'red-orange', 'orange', 'pink', 'salmon', 'blue', 'blue-alt', 'purple', 'violet', 'fuchsia', 'red-purple'];

	function renderPrograms() {

		chart.attr({
			width: data.programs.length * columnWidth
		});

		for ( var i = 0; i < data.programs.length; i++ ) {

			// create text
			var text = chart.text( columnWidth * i, height - 5, data.programs[i].name).attr({
				'class': 'chart-label ' + colors[i % colors.length]
			});

			var textWidth = $(text.node).width();

			text.attr({
				x: ( columnWidth * i ) + ( columnWidth - textWidth ) / 2
			});

			// create bar
			// TODO: height should be relative to program with highest # of total images,
			// which is 100% height of the chart
			var bar = chart.rect( columnWidth * i + 10, height - data.programs[i].total_images - 25, columnWidth - 20, data.programs[i].total_images ).attr({
				'class': colors[i % colors.length]
			});
		}
	}

	function handleData(theData) {
		data = theData;
		console.log(data);
		renderPrograms();
	}

	function retrieveData() {
		$.ajax({
			url: apiURL,
			success: handleData
		});
	}

	function init() {
		retrieveData();
	}

	init();

})();
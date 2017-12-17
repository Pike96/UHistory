var WeekCalendarView = function(container,model)
{
	// Calendar variables
	var cal = new CalHeatMap();
	var weekCalContainer = $("<div id='weekCalContainer'>");

	// Title
	var title = $('<h2>');
		title.html('Week / Hour View');
	container.append(title);

	// Buttons
	var nextButton = $("<button class='nextButton glyphicon glyphicon-chevron-right'>");
	var previousButton = $("<button class='previousButton glyphicon glyphicon-chevron-left'>");
	container.append(nextButton,previousButton);

	// Legend
	var dayLegend_y = $("<ul id='dayLegend_y'>");
	var weekDays = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
	for(i=0; i<weekDays.length; i++)
	{
		var dayName = $("<li>");
		dayName.html(weekDays[i]);
		dayLegend_y.append(dayName);
	}

	var dayLegend_x = $("<ul id='dayLegend_x'>");
	for(i=0; i<24; i++)
	{
		var hourName = $("<li>");
		hourName.html(i+":00");
		dayLegend_x.append(hourName);
	}

	// Color Legend Values
	var colorLegendValues = new Array;
	var colorLegendValuesContainer = $("<div id='colorLegendValuesContainer'>");

	strDate = new Date(Date.now());

	function createCalendar(data){

		var max = model.getHourlyMax();
		var cSize = 27;

		cal.init({
			data: data,
			itemSelector: "#weekCalContainer",
			domain: "week",
			subDomain: "x_hour",
			cellSize: cSize,
			cellPadding:2,
			tooltip: true,
			itemName: "site",
			domainGutter: 0,
			rowLimit:24,
			legendCellSize: 10,
			range: 1,
			start: strDate,
			displayLegend: true,
			legendVerticalPosition: "top",
			legendHorizontalPosition: "left",
			legendCellSize: 27,
			legendMargin:[-7,0,12,551],
			legend: [Math.round(max*0.2),Math.round(max*0.4),Math.round(max*0.6),Math.round(max*0.8)],
			onClick: function(date,value,rect)
			{
				$('#weekcal svg.graph rect').css('stroke','none');
				$('#weekcal svg.graph rect').attr('height',cSize).attr('width',cSize);

				// Also resetting the selection on the other calendars
				$('#cal svg.graph rect').attr('height',30).attr('width',30);
				$('#daycal svg.graph rect').attr('height',10).attr('width',10);
			
				$(rect).css('stroke','rgba(0,255,0,1)');
				$(rect).attr('height',cSize-1).attr('width',cSize-1);

				var item = model.hours.filter(function(d)
				{ 
					if( (d[0].getMonth() == date.getMonth()) && (d[0].getDate() == date.getDate()) && (d[0].getHours() == date.getHours()) ) return d;
				})

				if(item.length >0)
				{
					model.setSelectedItem(item[0]);
				}
			}
		});
		updateLegend(max)
	}

	function updateLegend(max)
	{
		colorLegendValues = [Math.round(max*0.2),Math.round(max*0.4),Math.round(max*0.6),Math.round(max*0.8)]
		colorLegendValuesContainer.empty();
	  	var colorLegendValue = $("<div id='colorLegendValueMin'>");
		colorLegendValue.html("<"+colorLegendValues[0]);
		colorLegendValuesContainer.append(colorLegendValue);

	  	var colorLegendValue = $("<div id='colorLegendValueMax'>");
		colorLegendValue.html(colorLegendValues[3]+"<");
		colorLegendValuesContainer.append(colorLegendValue);
	}

	// Append all items to the container
	this.nextButton = nextButton;
	this.previousButton = previousButton;
	this.cal = cal;

	// Observer Pattern
	model.addObserver(this);

	this.update = function(args)
	{
		if(args == 'dataReady')
		{	
			container.append(dayLegend_y,dayLegend_x);
			container.append(colorLegendValuesContainer);
			container.append(weekCalContainer);
			createCalendar(model.toJSON(model.hours));
		}

		else if((args == 'searchComplete' || 'itemRemoved') && model.getCurrentView() == "weekCalendar")
		{
			// Update the calendar with the new search data
			var data = model.toJSON(model.getHoursSearch());
			cal.update(data);
			cal.options.data = data;

			// Set the legend to the new max value
			var max = model.getHoursSearchMax();
			cal.setLegend([Math.round(max*0.2),Math.round(max*0.4),Math.round(max*0.6),Math.round(max*0.8)]);
			updateLegend(max)
		}
	}
}
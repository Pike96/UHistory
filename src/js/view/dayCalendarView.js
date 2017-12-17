var DayCalendarView = function(container,model)
{
	// Calendar variables
	var cal = new CalHeatMap();
	var dayCalContainer = $("<div id='dayCalContainer'>");
	
	// Title
	var title = $('<h2>');
		title.html('Month / Hour View');
	container.append(title);

	// Buttons
	var nextButton = $("<button class='nextButton glyphicon glyphicon-chevron-right'>");
	var previousButton = $("<button class='previousButton glyphicon glyphicon-chevron-left'>");
	container.append(nextButton,previousButton);

	// Legend
	var hourLegend = $("<ul id='hourLegend'>");
		for(i=0; i<24; i++)
	{
		var timebox = $("<li>");
		var hourName = $("<div style='text-align: right'>");
		hourName.html(i);
		timebox.append(hourName);
		hourLegend.append(timebox);
	}

	// Color Legend Values
	var colorLegendValues = new Array;
	var colorLegendValuesContainer = $("<div id='colorLegendValuesContainer'>");

	// stDate is the date the calender shows at start
	stDate = new Date(Date.now());
	stDate.setMonth(stDate.getMonth()-1);

	function createCalendar(data){

		var max = model.getHourlyMax();
		var cSize = 10;

		cal.init({
			data: data,
			itemSelector: "#dayCalContainer",
			domain: "month",
			subDomain: "hour",
			cellSize: cSize,
			cellPadding:2,
			tooltip: true,
			displayLegend: false,
			itemName: "site",
			domainGutter: 5,
			rowLimit:24,
			range: 2,
			start: stDate,
			displayLegend: true,
			legendVerticalPosition: "top",
			legendHorizontalPosition: "left",
			legendCellSize: 27,
			legendMargin:[-7,0,12,592],
			legend: [Math.round(max*0.2),Math.round(max*0.4),Math.round(max*0.6),Math.round(max*0.8)],
			onClick: function(date,value,rect)
			{
				$('#daycal svg.graph rect').css('stroke','none');
				$('#daycal svg.graph rect').attr('height',cSize).attr('width',cSize);
				
				// Also resetting the selection on the other calendar
				$('#cal svg.graph rect').attr('height',30).attr('width',30);
				$('#weekcal svg.graph rect').attr('height',27).attr('width',27);

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
			container.append(hourLegend);
			container.append(colorLegendValuesContainer);
			container.append(dayCalContainer);
			createCalendar(model.toJSON(model.hours));
		}

		else if((args == 'searchComplete' || 'itemRemoved') && model.getCurrentView() == "dayCalendar")
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
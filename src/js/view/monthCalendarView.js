var MonthCalendarView = function(container,model)
{
	// Calendar variables
	var cal               	= new CalHeatMap();
	var monthCalContainer 	= $("<div id='monthCalContainer'>");
	
	// Title
	var title             	= $('<h2>');
		title.html('Month / Day View');
	container.append(title);
	
	// Buttons
	var nextButton 			= $("<button class='nextButton glyphicon glyphicon-chevron-right'>");
	var previousButton 		= $("<button class='previousButton glyphicon glyphicon-chevron-left'>");
	container.append(nextButton,previousButton);

	// Legend
	var dayLegend 			= $("<ul id='dayLegend'>");
	var weekDays 			= ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
	for(i=0; i<weekDays.length; i++)
	{
		var dayName = $("<li>");
		dayName.html(weekDays[i]);
		dayLegend.append(dayName);
	}

	startDate 				= new Date(Date.now());
	startDate.setMonth(startDate.getMonth()-3);

	// Color Legend Values
	var colorLegendValues = new Array;
	var colorLegendValuesContainer = $("<div id='colorLegendValuesContainer'>");

	function createCalendar(data){

		var max = model.getDailyMax();
		var cSize = 30;

		cal.init({
			data: data,
			itemSelector: "#monthCalContainer",
			domain: "month",
			subDomain: "day",
			itemName: "site",
			range: 5,
			cellSize: cSize,
			cellPadding:2,
			domainMargin:[0,6,0,0],
			tooltip: true,
			highlight: "now",
			label:{
				offset:{x:0,y:-15}
			},
			start: startDate,
			displayLegend: true,
			legend: [Math.round(max*0.2),Math.round(max*0.4),Math.round(max*0.6),Math.round(max*0.8)],
			legendVerticalPosition: "top",
			legendHorizontalPosition: "left",
			legendCellSize: 30,
			
			legendMargin:[-10,0,12,568],
			onClick: function(date,value,rect)
			{
				$('#cal svg.graph rect').css('stroke','none');
				$('#cal svg.graph rect').attr('height',cSize).attr('width',cSize);

				// Also resetting the selection on the other calendar
				$('#daycal svg.graph rect').attr('height',10).attr('width',10);
				$('#weekcal svg.graph rect').attr('height',27).attr('width',27);

				$(rect).css('stroke','rgba(0,255,0,1)');
				$(rect).attr('height',cSize-1).attr('width',cSize-1);

				var item = model.days.filter(function(d)
				{ 
					if( (d[0].getMonth() == date.getMonth()) && (d[0].getDate() == date.getDate()) ) return d;
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
			container.append(dayLegend);
			container.append(colorLegendValuesContainer);
			container.append(monthCalContainer);
			createCalendar(model.toJSON(model.days));
		}

		else if((args == 'searchComplete' || 'itemRemoved') && model.getCurrentView() == "monthCalendar")
		{
			// Update the calendar with the new search data
			var data = model.toJSON(model.getDaysSearch())
			cal.update(data);
			cal.options.data = data;
			// Set the legend to the new max value
			var max = model.getDaysSearchMax();
			cal.setLegend([Math.round(max*0.2),Math.round(max*0.4),Math.round(max*0.6),Math.round(max*0.8)]);

			updateLegend(max);
		}
	}
}
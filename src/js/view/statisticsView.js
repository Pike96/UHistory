var StatisticsView = function(container,model)
{	
	var color = d3.scale.category20();	
	var statisticsTitle =		$("<h2>");
	var daysReady	=	false;
	var hoursReady	=	false;

	statisticsTitle.html("Your browsing statistics");
	
	//top visited statistics
	var topSitesBox = 			$("<div id='topSitesBox'>");
	var piechart = 				$("<div id='piechart'>");
  	var topSitesList = 			$("<ul id='topSitesList'>");

  	topSitesBox.append(piechart,topSitesList);
	
  	//daily & hourly statistics
  	var visitsBox = 			$("<div id='visitsBox'>");	
  	var visitsTitle = 			$("<span id='visitsTitle'>"); 
  	var dailyBarGraphBox = 		$("<div id='dailyBargraph'>");
  	var hourlyBarGraphBox = 	$("<div id='hourlyBargraph'>");
  	var onDemandBarGraphBox = 	$("<div id='onDemandBargraph'>");
	
	//buttons 
	var viewbuttonGroup =		$("<div class='btn-group'>")
	var daysButton = 			$("<button class='btn btn-default active' id='daysButton'>");
	var hoursButton = 			$("<button class='btn btn-default' id='hoursButton'>");

	daysButton.html("Days");
	hoursButton.html("Hours");
	
	var dailysortButtonContainer=	$("<div class='buttonContainer'>");
  	var hourlysortButtonContainer=	$("<div class='buttonContainer'>");
  	var dailySortButton = 		$("<input type='checkbox' id='dailySortButton'>");
 	var hourlySortButton = 		$("<input type='checkbox' id='hourlySortButton'>");
 	var sortButtonText = 		$("<b>");
	
	visitsTitle.html("Average visits per day");
  	sortButtonText=" Sort by visits";
  	
	dailysortButtonContainer.append(dailySortButton,sortButtonText);
	hourlysortButtonContainer.append(hourlySortButton,sortButtonText);
	viewbuttonGroup.append(hoursButton,daysButton);

	dailyBarGraphBox.append(dailysortButtonContainer);
	hourlyBarGraphBox.append(hourlysortButtonContainer);
	visitsBox.append(visitsTitle,viewbuttonGroup,dailyBarGraphBox,hourlyBarGraphBox,onDemandBarGraphBox);

 	/*****************************************  
	  		Append items to container  
	*****************************************/
	container.append(statisticsTitle,topSitesBox,visitsBox);

	function updateData()
	{	
		var totalVisitedPerSite = model.getSiteRanking();
	 	var topData = model.getTop();

	  	// Legend for pie-chart
	  	for(i=0; i<topData.length-1; i++){	
	  		var legendItem = 		$("<li class='legendItem'>");
	  		var legendColor = 		$("<div class='legendColor'>");
	  		var topSitesURL = 		$("<div class='topSitesURL'>");
	  		var topSitesVisits = 	$("<div class='topSitesVisits'>");
	  		topSitesURL.html(topData[i][0]);
	  		topSitesVisits.html(topData[i][1]);
	  		legendItem.append(legendColor,topSitesURL,topSitesVisits);
	  		topSitesList.append(legendItem);
	  		legendColor.attr("style", "background-color:"+color(i));
	  	}

	  	// visited per day
	  	var totalVisitedPerDay = model.getDailyAverages();
	 	// to visited per day
	  	var topDailyDataPerSite = model.getDailyTop();
	  	// visited per hour
	  	var totalVisitedPerHour = model.getHourlyAverages();
	  	// top visited per hour
	 	var topHourlyDataPerSite = model.getHourlyTop();
		// Create pie chart
	  	var piechartView = new PiechartView(container,model,topData,topHourlyDataPerSite,topDailyDataPerSite,totalVisitedPerDay,totalVisitedPerHour);
	  	// Create bar chart
		var barGraphView = new BarGraphView(container,model,totalVisitedPerDay,1);
		var barGraphView = new BarGraphView(container,model,totalVisitedPerHour,2);
	}

	this.daysButton = daysButton;
	this.hoursButton = hoursButton;	
	
	// Observer Pattern
	model.addObserver(this);

	this.update = function(args)
	{
		if(args == 'dataReady')
		{
			updateData();
		}
	}
 }
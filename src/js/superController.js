$(function()
{
	var model = new IbrowseModel();

	var loadingView = new LoadingView($("#loading"),model);
	var loadingController = new LoadingController(loadingView,model);

	var calendarView = new CalendarView($("#calendar"),model);
	var calendarController = new CalendarController(calendarView,model);

	var searchBarView = new SearchBarView($("#search"),model);
	var searchBarController = new SearchBarController(searchBarView,model);

	var historyView = new HistoryView($("#history"),model);
	var historyController = new HistoryController(historyView,model);

	var statisticsView = new StatisticsView($("#statistics"),model);
	var statisticsController = new StatisticsController(statisticsView,model);

	//var barGraphView = new BarGraphView($("#statistics"),model);
	//var barGraphController = new BarGraphController(barGraphView,model);
	/*
	var piechartView = new PiechartView($("#statistics"),model);
	var piechartController = new PiechartController(piechartView,model);

	$("#statistics").draggable({

	});*/

});

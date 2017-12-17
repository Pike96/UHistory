var StatisticsController = function(view,model)
{	
	$("#hourlyBargraph").hide();
	view.daysButton.click(function(){
		$(this).addClass("active");
		$(view.hoursButton).removeClass('active');
		$("#hourlyBargraph").hide();
		$("#dailyBargraph").show();
		view.setTitle = "days";
		document.getElementById('visitsTitle').innerHTML ='Average visits per day';
	})

	view.hoursButton.click(function(){
		$(this).addClass("active");
		$(view.daysButton).removeClass('active');
		$("#hourlyBargraph").show();
		$("#dailyBargraph").hide();
		view.setTitle = "hours";
		document.getElementById('visitsTitle').innerHTML ='Average visits per hour';
	})
}
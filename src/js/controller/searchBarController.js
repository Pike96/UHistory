var SearchBarController = function(view,model)
{	
	var interval;
	view.searchInput.keyup(function(){
		// Setting interval so the cal won't get slow
		if(interval != null)
		{
			clearTimeout(interval);
		}
		interval = setTimeout(function(){
			model.search(view.searchInput.val());
		},500)
	});

	view.removeInput.click(function(){

		view.searchInput.val("");
		model.search(view.searchInput.val());
		
	});

	function hideAll(){
		$("#cal, #weekcal, #daycal, #statistics").hide();
		$(view.monthButton).removeClass('active');
		$(view.weekButton).removeClass('active');
		$(view.dayButton).removeClass('active');
		$(view.statsButton).removeClass('active');
	}

	view.monthButton.click(function(){
		model.setCurrentView("monthCalendar");
		model.search(view.searchInput.val());
		hideAll();
		$(this).addClass("active");
		$("#cal").show();
		$("#history").show();
	})

	view.weekButton.click(function(){
		model.setCurrentView("weekCalendar");
		model.search(view.searchInput.val());
		hideAll();
		$(this).addClass("active");
		$("#weekcal").show();
		$("#history").show();
	})

	view.dayButton.click(function(){
		model.setCurrentView("dayCalendar");
		model.search(view.searchInput.val());
		hideAll();
		$(this).addClass("active");
		$("#daycal").show();
		$("#history").show();
	})

	view.statsButton.click(function(){
		model.setCurrentView("statistics");
		hideAll();
		$(this).addClass("active");
		$("#history").hide();
		$("#statistics").show();
	})
}
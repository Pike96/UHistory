var MonthCalendarController = function(view,model)
{
	view.nextButton.click(function(){
		view.cal.next();
	});

	view.previousButton.click(function(){
		view.cal.previous();
	});
}
var HistoryItemController = function(view,model)
{
	view.removeButton.click(function(){

		chrome.history.deleteUrl({"url":view.url},function()
		{
			model.removeUrl(view.url);
			$(view.container).slideUp(100,'easeInQuart');
		});

	});
}
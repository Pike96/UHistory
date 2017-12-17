var HistoryView = function(container,model)
{	
	var historyBox  = $("<div>");
	var historyList = $("<ul class='historyList'>");


	// Static variables for creating dates
	var monthNames = new Array("January", "February", "March", 
		"April", "May", "June", "July", "August", "September", 
		"October", "November", "December");

	var dayNames = new Array("Sunday","Monday","Tuesday","Wednesday",
		"Thursday","Friday","Saturday");

	function updateHistory()
	{
		historyList.empty();
		var item = model.getSelectedItemSearch();
		
		if(item!= null)
		{
			// Sort items by Time
			item[1].sort(function(a,b)
			{
				return b[3]-a[3];
			});

			// Creating date from timestamp
			var title = $("<li class='historyViewTitle'>");
			var day = dayNames[item[0].getDay()];
			var month = monthNames[item[0].getMonth()]
			var date = item[0].getDate();
			var year = item[0].getFullYear();

			title.html(day+", "+month+" "+date+", "+year);

			historyList.append(title);

			for(i=0;i<item[1].length;i++)
			{
				var listItem = $("<li>");
				var historyItemView = new HistoryItemView(listItem,model,item);
				var historyItemController = new HistoryItemController(historyItemView,model);
				historyList.append(listItem);
			}
		}
		
	}

	historyBox.append(historyList);
	container.append(historyBox);

	// Observer Pattern
	model.addObserver(this);

	this.update = function(args)
	{
		if(args == "searchComplete")
		{
			updateHistory();
		}
	}
}
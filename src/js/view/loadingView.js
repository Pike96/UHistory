var LoadingView = function(container,model)
{	
	var loadingTitle 	= $("<h2 id='loadingTitle'>LOADING HISTORY</h2>")

	var barContainer 	= $("<div id='loadingContainer'>");
		barContainer.append(loadingTitle);
	
	container.append(barContainer);

		// Observer Pattern
	model.addObserver(this);

	this.update = function(args)
	{
		if(args == "dataReady")
		{
			container.fadeOut(1200);
		}
	}
}
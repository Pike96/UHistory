var SearchBarView = function(container,model)
{
	// Searchform
	var menuContainer = $("<div id='menuContainer'>");
	var form = $("<div id='searchBar'>");
	var searchInput = $("<input type='text' class='form-control' placeholder='Search History'>");
	var removeInput = $("<i title='Clear search' class='glyphicon glyphicon-remove'>");
	form.append(searchInput,removeInput);

	// View navigation

	var buttonGroup = 		$("<div class='btn-group'>");
	var monthButton = 		$("<button title='Month / Day View' class='btn btn-default active'>");
	var weekButton = 		$("<button title='Week / Hour View' class='btn btn-default'>");
	var dayButton = 		$("<button title='Month / Hour View' class='btn btn-default'>");
	var statsButton	= 		$("<button title='Statistics View' class='btn btn-default'>");

	var monthSpan = 		$("<span class='glyphicon glyphicon-th-large'>");
	var weekSpan = 			$("<span class='glyphicon glyphicon-th-list'>");
	var daySpan = 			$("<span class='glyphicon glyphicon-th'>");
	var statsSpan = 		$("<span class='glyphicon glyphicon-stats'>");

	monthButton.append(monthSpan);
	weekButton.append(weekSpan);
	dayButton.append(daySpan);
	statsButton.append(statsSpan);

	buttonGroup.append(monthButton,weekButton,dayButton,statsButton);
	
	menuContainer.append(form,buttonGroup);
	container.append(menuContainer);

	// Bindings to self
	this.searchInput = searchInput;
	this.removeInput = removeInput;
	this.monthButton = monthButton;
	this.weekButton  = weekButton;
	this.dayButton 	 = dayButton;
	this.statsButton = statsButton;

	model.addObserver(this);
	
	this.update = function(args){
		if(args == 'dataReady'){	
			// focus on searchinput
			searchInput.focus();
		}
	}
}
var HistoryItemView = function(container,model,item)
{
	var url 		= item[1][i][1];
	var time 		= new Date(item[1][i][3]);

	var baseUrl 	= $('<a>').prop('href',url).prop('hostname');
	var baseUrlBox 	= $("<div class='baseUrlBox'>")
		baseUrlBox.append(baseUrl);

	var timeBox 	= $("<div class='timeBox'>");
		timeBox.html(time.getHours()+":"+(time.getMinutes()<10?'0':'')+time.getMinutes());
	
	var favicon 	= $("<img>");
		favicon.prop('src',"chrome://favicon/http://"+baseUrl);
	var faviconBox 	= $("<div class='faviconBox'>");
		faviconBox.append(favicon);
	
	var removeButton = $("<span title='Remove from history' class='removeUrl glyphicon glyphicon-remove'>");

	
	var link 		= $("<a>");
		link.prop("href",url);
		link.prop("target","_blank");

	if(item[1][i][2] != ""){
		link.html(item[1][i][2]);
	}
	else{
		link.html(item[1][i][1]);
	}
	var linkBox 	= $("<div class='linkBox'>");
		linkBox.append(link);

	this.url = url;
	this.removeButton = removeButton;
	this.time = time;
	this.container = container;

	container.append(timeBox);
	container.append(faviconBox);
	container.append(linkBox);
	container.append(removeButton);
	container.append(baseUrlBox);
}
var IbrowseModel = function() {

	var history 			= [];

	var days 				= [];
	this.days = days;
	
	var hours 				= [];
	this.hours = hours;

	var lastSearchString 	= "";
	var daysSearch 			= [];
	var hoursSearch 		= [];
	var selectedItemSearch 	= [];

	var currentStats;
	var selectedItem;
	var currentView 		= "monthCalendar";

	var siteRanking 		= [];

	var dailyAverages;
	var hourlyAverages;
	var top;
	var hourlyTop;
	var dailyTop;

	// milliseconds in one hour
	var hourMs 				= 3600000;
	var dayMs   			= 86400000;


	/********************************************************************************
		Important: days[i]/hours[i] etc finally contains three arrays per day.

		The first one (days[i][0]) is one with the day date.
		The second one (days[i][1]) has the individual url visits from chrome.
			And days[i][1][0] = the Unique ID
				days[i][1][1] = the URL
				days[i][1][2] = the Title
				days[i][1][3] = the Timestamp
		The third days[i][2] is an array containing the number of visits per site.
	*********************************************************************************/

  /*******************************
   Run on startup
   *******************************/
  var run = setTimeout(getHistory, 1000);

	/*******************************
	   Getting the actual history
	   from Google Drive
	*******************************/

  function getHistory() {
    history = [];
    chrome.identity.getAuthToken({ 'interactive': false }, function(token) {
      if (token == null) {
        return;
      }
      gapi.auth.setToken({'access_token': token});
      gapi.client.load('drive', 'v3').then(function () {
        history.length = 0;
        gapi.client.drive.files.list({
          'q': "trashed = false and name contains 'UHB' and name contains 'txt'",
          'fields': "nextPageToken, files(id, name)"
        }).then(function (response) {
          var files = response.result.files;
          var i = 0;
          loop(files, i);
          // }
        });
      });
    });
	}

	function loop(files, i) {
    if (i == files.length - 1) {
      readFile(files[i].id, files, i, afterRead);
    } else {
      readFile(files[i].id, files, i, loop);
    }
  }

	function afterRead() {
    // Convert the raw data in time-unit based arrays
    historyPerTimeUnit(history, hourMs, hours);
    historyPerTimeUnit(history, dayMs, days);
    // Create the top lists and statistics
    createStats();

    // Notify observers that the data is ready
    notifyObservers('dataReady');

    // Search for nothing so all arrays are filled
    setSelectedItem(days[days.length - 1]);
  }

  // function readFile(fileID, files, i, callback) {
  //   gapi.client.drive.files.export({
  //     'fileId' : fileID,
  //     'mimeType' : 'text/csv'
  //   }).then(function(success){
  //     console.log(success);
  //     var subHistory = success.body.substring(success.body.indexOf("\n") + 1);
  //     subHistory = $.csv.toArrays(subHistory, {separator: '`'});
  //     historyAdd(subHistory);
  //     if (callback) {
  //       callback(files, i + 1);
  //     }
  //   }, function(fail){
  //     console.log(fail);
  //     console.log('Error '+ fail.result.error.message);
  //   })
  // }

  function readFile(fileID, files, i, callback) {
    gapi.client.request({'path': '/drive/v2/files/'+fileID,'method': 'GET',callback: function ( theResponseJS, theResponseTXT ) {
        var myToken = gapi.auth.getToken();
        var myXHR   = new XMLHttpRequest();
        myXHR.open('GET', theResponseJS.downloadUrl, true );
        myXHR.setRequestHeader('Authorization', 'Bearer ' + myToken.access_token );
        myXHR.onreadystatechange = function( theProgressEvent ) {
          if (myXHR.readyState == 4) {
            if ( myXHR.status == 200 ) {
              var subHistory = myXHR.response.substring(myXHR.response.indexOf("\n") + 1);
              subHistory = $.csv.toArrays(subHistory, {separator: '|@|@', delimiter:'```'});
              historyAdd(subHistory);
              if (callback) {
                callback(files, i + 1);
              }
            }
          }
        }
        myXHR.send();
      }
    });
  }

  function historyAdd(subHistory) {
    var temp = [];
    var i;
    for (i = 0; i < subHistory.length; i ++) {
      var item = new Array();
      //item.push(subHistory[i][0], subHistory[i][1], subHistory[i][2], parseFloat(subHistory[i][3]));
      item.push(subHistory[i][0], subHistory[i][4], subHistory[i][2], parseFloat(subHistory[i][1]));
      history.push(item);
    }
  }

	function historyPerTimeUnit(history,timeUnit,target)
	{
		target.length = 0;

		var d = new Date();
			d.setDate(d.getDate()-90);
			d.setHours(0);
			d.setMinutes(0);
			d.setSeconds(0);
			d.setMilliseconds(0);
		var dstStart = d.dst();

		var endTime = new Date();
			endTime.setDate(endTime.getDate()+1);
			endTime.setHours(0);
			endTime.setMinutes(0);
			endTime.setSeconds(0);
			endTime.setMilliseconds(0);

		for(d; d<endTime; d.setTime(d.getTime()+timeUnit)){
			
			// DST fix if DST is in the history data set
			if( timeUnit == dayMs && dstStart != d.dst() ){
				if( dstStart == true ){
					d.setHours(0);
					d.setDate(d.getDate()+1);
				}else if( d.dst() == true ){
					d.setHours(0);
				}
			}
			dstStart = d.dst();
			
			var unit = new Array();
			unit.push(new Date(d.getTime()));
			unit[1] = [];
			
			for(i=0; i < history.length; i++){
				if( (history[i][3] >= d.getTime()) && (history[i][3] < (d.getTime()+timeUnit)) ){
					unit[1].push(history[i]);
				}
			}
			unit.push(createSiteCount(unit[1]));
			target.push(unit);
		}
	}

	/*******************************
			Search Functions
	********************************/
	function searchHistory(string, inside){
		var data = [];
		for (i = 0; i<inside.length; i++){
			var item = [];
			item.push(inside[i][0]);
			var result = inside[i][1].filter(function(d){
				if(d[1].indexOf(string.toLowerCase())>=0 || d[2].indexOf(string.toLowerCase())>=0){
					return d;
				}
			});
			item.push(result);
			
			data.push(item);
		}		
		return data;
	}

	function search(string){
		// setting lastSearchString so it can be used again
		lastSearchString 	= string;
		daysSearch 			= searchHistory(string, days);
		hoursSearch 		= searchHistory(string, hours);
		selectedItemSearch 	= searchHistory(string, [selectedItem])[0];
		notifyObservers('searchComplete');
	}
	this.search = search;

	/*******************************
		Convert the normal array
		to JSON for d3 Calendar
		but only with visits.
	********************************/
	function toJSON(data){
		var json = {};
		for(i=0; i < data.length; i++){
			json[Math.round(data[i][0].getTime()/1000)] = data[i][1].length;
		}
		return json;
	}
	this.toJSON = toJSON;

	/*******************************
		Create top-sites for 
		single time unit.
	********************************/
	function createSiteCount(data){
		var urlArray = new Array();

		// Getting the starting of the url
		for(j = 0; j<data.length; j++){
			var url = $('<a>').prop('href',data[j][1]).prop('hostname');
			urlArray.push(url);
		}
		// Creating associative array from url count
		var counts = new Array();
		urlArray.forEach(function(x){ 
			counts[x] = (counts[x] || 0)+1; 
		});

		// Make a normal array out of the associative one
		var countsNormalArray = new Array();
		for(key in counts){
			if(key != ""){
				countsNormalArray.push([key,counts[key]]);
			}
			else{
				countsNormalArray.push(["local files",counts[key]]);
			}
		}

		// Sorting the array in descending order
		countsNormalArray.sort(function(a,b){
			return b[1]-a[1];
		});

		return countsNormalArray;
	}

	/*******************************
		Remove url from current
		arrays so we dont need
		to reload
	********************************/
	function removeUrl(url)
	{
		removeFromArray(hours);
		removeFromArray(days);
		removeFromArray(daysSearch);
		removeFromArray(hoursSearch);

		function removeFromArray(array)
		{
			for(i=0;i<array.length;i++)
			{
				for(j=0;j<array[i][1].length;j++)
				{
					if(array[i][1][j][1] === url)
					{
						array[i][1].splice(j,1);
					}
				}
			}
		}
		notifyObservers('itemRemoved');
	}
	this.removeUrl = removeUrl;

	/*******************************
		Create overall, per hour
		and per day statistics
	********************************/
	function createStats(){
		siteRanking = createSiteCount(history);
		createHourlyAverages();
		createDailyAverages();
		createTop();
		createHourlyTop();
		createDailyTop();
	}

	function createHourlyAverages(){
		var visits 		= [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
		var count 		= [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

		for(i = 0; i<hours.length; i++)
		{
			visits[hours[i][0].getHours()] += hours[i][1].length;
			count[hours[i][0].getHours()] ++;
		}
		
		for (i=0; i<visits.length;i++){
	 		visits[i] 	= (visits[i]/count[i]).toFixed(1);
	 	}
		hourlyAverages 	= visits;
	}

	function createDailyAverages(){
		var visits 		= [0,0,0,0,0,0,0];
		var count 		= [0,0,0,0,0,0,0];
		for(i = 0; i<days.length; i++)
		{
			visits[days[i][0].getDay()] += days[i][1].length;
			count[days[i][0].getDay()] ++;
		}
		
		for (i=0; i<visits.length;i++){
	 		visits[i] = (visits[i]/count[i]).toFixed(0);
	 	}
	 	// Javascript counts sunday as first weekday so splice it baby
	 	visits.push(visits.splice(0,1)[0]);
		dailyAverages = visits;
	}

	function createTop(){
		var ranking 	= getSiteRanking();
		var topData 	= [];
		var count 		= 0;
		for (i = 0; i< ranking.length; i++){
	  	  	if(i<10){
		  		topData.push(ranking[i]);
		  	}
		  	else if (i < ranking.length-1){
		  		count += ranking[i][1];
		  	}
		  	else{
		  		count += ranking[i][1];
		  		topData.push(["Other",count]);
		  	}
	  	}
	  	top = topData;
	}

	function createHourlyTop(){
		var topData 				= getTop();
	 	var topHourlyDataPerSite 	= [];
	 	var averages 				= dailyAverages; 

	 	for(i=0;i<topData.length;i++){	
	  		topHourlyDataPerSite.push([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	  		var hourNumber2 = 0;
		
			for (j=0; j<90; j++){
		 		for(k=0; k<24; k++){	
		 			for(l=0;l<hours[k+hourNumber2][2].length; l++){	
			 			if (hours[k+hourNumber2][2][l][0] == topData[i][0]){	
			 				topHourlyDataPerSite[i][k] += hours[k+hourNumber2][2][l][1];
			 			}
		 			} 							 
				}
				hourNumber2 +=24;
		 	}
		 	//make averages
		 	for (m=0; m<topHourlyDataPerSite[i].length;m++){
		 		topHourlyDataPerSite[i][m] = (topHourlyDataPerSite[i][m]/90).toFixed(1);
		 	}
		 	
		}
		// create 'other' category
		for(i=0;i<topHourlyDataPerSite[topHourlyDataPerSite.length-1].length;i++)
		{	
			topHourlyDataPerSite[topHourlyDataPerSite.length-1][i] = hourlyAverages[i]
			for(j=0; j<topHourlyDataPerSite.length-2; j++)
			{
				topHourlyDataPerSite[topHourlyDataPerSite.length-1][i] -= topHourlyDataPerSite[j][i]
				topHourlyDataPerSite[topHourlyDataPerSite.length-1][i] = topHourlyDataPerSite[topHourlyDataPerSite.length-1][i].toFixed(1);
			}
		}
		hourlyTop = topHourlyDataPerSite;
	}

	function createDailyTop(){
		var topData = getTop();
		var data 	= [];
		var count 	= [];

	  	for(i=0; i<topData.length ;i++){
	  		data.push([0,0,0,0,0,0,0]);
	  		count = [0,0,0,0,0,0,0];

		   	for(j = 0; j<days.length; j++){
		   		for(k=0; k<days[j][2].length ;k++){
		 			if(days[j][2][k][0] == topData[i][0]){	
		 				data[i][days[j][0].getDay()] += days[j][2][k][1];
		 			}
		 		}
		 		count[days[j][0].getDay()] ++;
		   	}
		 	//make averages
		 	for (j=0; j<data[i].length;j++){
		 		data[i][j] = (data[i][j]/count[j]).toFixed(0);
		 	}
		 	// Javascript counts sunday as first weekday so splice it baby
	 		data[i].push(data[i].splice(0,1)[0]);
	  	}
	  	// create 'other' category
	  	for(i=0;i<data[data.length-1].length;i++)
		{	
			data[data.length-1][i] = dailyAverages[i]
			for(j=0; j<data.length-2; j++)
			{
				data[data.length-1][i] -= data[j][i]
			}
		}
	  	dailyTop = data;
	}

	/*******************************
			Helper functions
	********************************/
	function getMax(history){
		var max = 0;
		for(i = 0; i < history.length; i++){
			if(history[i][1].length > max){
				max = history[i][1].length;
			}
		}
		return max;
	}

	Date.prototype.stdTimezoneOffset = function() {
	    var jan = new Date(this.getFullYear(), 0, 1);
	    var jul = new Date(this.getFullYear(), 6, 1);
	    return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
	}

	Date.prototype.dst = function() {
	    return this.getTimezoneOffset() < this.stdTimezoneOffset();
	}

	/*******************************
				Setters
	********************************/
	function setSelectedItem(item){
		selectedItem = item;
		search(lastSearchString);
	}
	this.setSelectedItem = setSelectedItem;

	function setCurrentView(string){
		currentView = string;
	}
	this.setCurrentView = setCurrentView;

	function setDaysSearch(value){
		daysSearch = value;
	}

	/*******************************
				Getters
	********************************/
	function getSiteRanking(){
		return siteRanking;
	}
	this.getSiteRanking = getSiteRanking;

	function getTop(){
	  	return top;
	}
	this.getTop = getTop;

	function getDailyTop()
	{	
		return dailyTop;
	}
	this.getDailyTop = getDailyTop;

	function getHourlyTop()
	{	
		return hourlyTop;
	}
	this.getHourlyTop = getHourlyTop;

	function getDailyAverages()
	{
		return dailyAverages;
	}
	this.getDailyAverages = getDailyAverages;

	function getHourlyAverages()
	{
		return hourlyAverages;
	}
	this.getHourlyAverages = getHourlyAverages;

	function getDailyMax(){
		return getMax(days);
	}
	this.getDailyMax = getDailyMax;

	function getDaysSearchMax(){
		return getMax(daysSearch);
	}
	this.getDaysSearchMax = getDaysSearchMax;

	function getHourlyMax(){
		return getMax(hours);
	}
	this.getHourlyMax = getHourlyMax;

	function getHoursSearchMax(){
		return getMax(hoursSearch);
	}
	this.getHoursSearchMax = getHoursSearchMax;

	function getDaysSearch(){
		return daysSearch;
	}
	this.getDaysSearch = getDaysSearch;

	function getHoursSearch(){
		return hoursSearch;
	}
	this.getHoursSearch = getHoursSearch;

	function getSelectedItemSearch(){
		return selectedItemSearch;
	}
	this.getSelectedItemSearch = getSelectedItemSearch;

	function getCurrentView(){
		return currentView;
	}
	this.getCurrentView = getCurrentView;

	function getLastSearchString(){
		return lastSearchString;
	}
	this.getLastSearchString = lastSearchString;

	/*******************************
			   Observable
	********************************/
	var listeners = [];
	
	notifyObservers = function (args) {
	    for (var i = 0; i < listeners.length; i++){
	        listeners[i].update(args);
	    }
	};
	
	this.addObserver = function (listener) {
	    listeners.push(listener);
	};


}

function handleClientLoad() {
  // Load the API's client and auth2 modules.
  // Call the initClient function after the modules load.
  gapi.load('client:auth2');
}
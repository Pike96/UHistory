var PiechartView = function(container,model,topData)
{
	var w = 500;
	var h = 420;
	var r = 200;
	var ir = 130;
	var textOffset = 25;
	var tweenDuration = 250;
	
	var totalVisitedPerDay = totalVisitedPerDay;
	var totalVisitedPerHour = totalVisitedPerHour;
	var pieSelected = false;
	var selectedPie = 0;

	//OBJECTS TO BE POPULATED WITH DATA LATER
	var lines, valueLabels, nameLabels, favIcons;
	var pieData = [];    
	var oldPieData = [];
	var filteredPieData = [];

	//D3 helper function to populate pie slice parameters from array data
	var donut = d3.layout.pie().value(function(d){
	  return d[1];
	});

	//D3 helper function to create colors from an ordinal scale
	var color = d3.scale.category20();

	//D3 helper function to draw arcs, populates parameter "d" in path object
	var arc = d3.svg.arc()
	  .startAngle(function(d){ return d.startAngle; })
	  .endAngle(function(d){ return d.endAngle; })
	  .innerRadius(ir)
	  .outerRadius(r);

	///////////////////////////////////////////////////////////
	// CREATE VIS & GROUPS ////////////////////////////////////
	///////////////////////////////////////////////////////////

	var vis = d3.select("#piechart").append("svg:svg")
	  .attr("width", w)
	  .attr("height", h);

	//GROUP FOR ARCS/PATHS
	var arc_group = vis.append("svg:g")
	  .attr("class", "arc")
	  .attr("transform", "translate(" + (w/2) + "," + (h/2) + ")");

	//GROUP FOR LABELS
	var label_group = vis.append("svg:g")
	  .attr("class", "label_group")
	  .attr("transform", "translate(" + (w/2) + "," + (h/2) + ")");

	//GROUP FOR CENTER TEXT  
	var center_group = vis.append("svg:g")
	  .attr("class", "center_group")
	  .attr("transform", "translate(" + (w/2) + "," + (h/2) + ")");

	//PLACEHOLDER GRAY CIRCLE
	var paths = arc_group.append("svg:circle")
	    .attr("fill", "#EFEFEF")
	    .attr("r", r);

	///////////////////////////////////////////////////////////
	// CENTER TEXT ////////////////////////////////////////////
	///////////////////////////////////////////////////////////

	//WHITE CIRCLE BEHIND LABELS
	var whiteCircle = center_group.append("svg:circle")
	  .attr("fill", "white")
	  .attr("r", ir-1) // added -1
	  .attr("cursor", "pointer")
	  .on("mouseover",update_center)
	  .on("mouseout",remove_center)
	  .on("click",restore_piechart);

	// "TOTAL" LABEL
	var totalLabel = center_group.append("svg:text")
	  .attr("class", "label")
	  .attr("dy", -45)
	  .attr("text-anchor", "middle") // text-align: right
	  .attr("fill", "#333333")
	  .text("TOTAL");

	//TOTAL TRAFFIC VALUE
	var totalValue = center_group.append("svg:text")
	  .attr("class", "total")
	  .attr("dy", 20)
	  .attr("text-anchor", "middle") // text-align: right
	  .attr("fill", "#333333")
	  totalValue.attr("font-size",60)
	  .text("Select day");

	//UNITS LABEL
	var totalUnits = center_group.append("svg:text")
	  .attr("class", "units")
	  .attr("dy", 55)
	  .attr("text-anchor", "middle") // text-align: right
	  .attr("fill", "#333333")
	  .text("Sites");


	///////////////////////////////////////////////////////////
	// STREAKER CONNECTION ////////////////////////////////////
	///////////////////////////////////////////////////////////
	update();
	var totalSites = 0;
	// to run each time data is generated
	function update() 
	{
	  streakerDataAdded = topData;

	  oldPieData = filteredPieData;
	  pieData = donut(streakerDataAdded);

	  
	  filteredPieData = pieData.filter(filterData);
	  function filterData(element, index, array) {
	    element.name = streakerDataAdded[index][0];
	    element.value = streakerDataAdded[index][1];
	    totalSites += element.value;
	    return (element.value > 0);
	  }

	  if(filteredPieData.length > 0 && oldPieData.length > 0){

	    //REMOVE PLACEHOLDER CIRCLE
	    arc_group.selectAll("circle").remove();

	    totalValue.text(function(){
	      return totalSites;
	    });

	    //DRAW ARC PATHS
	    paths = arc_group.selectAll("path").data(filteredPieData);
	    paths.enter().append("svg:path")
	      .attr("stroke", "white")
	      .attr("stroke-width", 2)
	      .attr("cursor", "pointer")
	      .attr("fill", function(d, i) { return color(i); })
	      .on("mouseover",update_legend)
	  	  .on("mouseout",remove_legend)
	  	  .on("click",create_bargraph)
	      .transition()
	        .duration(tweenDuration)
	        .attrTween("d", pieTween);
	  }  

	}

	///////////////////////////////////////////////////////////
	// FUNCTIONS //////////////////////////////////////////////
	///////////////////////////////////////////////////////////

	d3.selection.prototype.moveToFront = function() {
	  return this.each(function(){
	    this.parentNode.appendChild(this);
	  });
	};

	function update_legend(d)
    {
		// "TOTAL" LABEL
	 	totalLabel.text(d.name);
		//TOTAL TRAFFIC VALUE
		totalValue.text((d.value/totalSites*100).toFixed(1) + "%")
		//UNITS LABEL
		totalUnits.text("OF VISITS");

		if (pieSelected == true && d.name != selectedPie.name)
	    {
			d3.select(this)
	      	.attr("stroke-width", 2)
	      	.attr("stroke","white")
	      	.attr("cursor", "pointer")
	      	.attr("opacity", 0.7);
	    }

		d3.select(this)
			.attr("stroke","#333")
		    .attr("opacity", 1)
		    .moveToFront();

		d3.select("#piechart .arc path.selected")
	    	.moveToFront();
    }

    function remove_legend(d)
    {
    	if (pieSelected ==false)
    	{
		// "TOTAL" LABEL
		  totalLabel.text("TOTAL");

		//TOTAL TRAFFIC VALUE
		  totalValue.text(totalSites);

		//UNITS LABEL
		  totalUnits.text("VISITS");

		d3.selectAll("#piechart .arc path")
		  	.attr("opacity", 1)
		  	.attr("stroke-width", 2)
		  	.attr("stroke","white");

	    }
	    else if (pieSelected == true && d.name != selectedPie.name)
	    {
	    // "TOTAL" LABEL
	 	totalLabel.text(selectedPie.name);
		//TOTAL TRAFFIC VALUE
		totalValue.text((selectedPie.value/totalSites*100).toFixed(1) + "%");
		//UNITS LABEL
		totalUnits.text("OF VISITS");
		d3.select(this)
	      	.attr("stroke-width", 2)
	      	.attr("stroke","white")
	      	.attr("cursor", "pointer")
	      	.attr("opacity", 0.4);
	    }
	}

    function create_bargraph(d)
    {	
    	if (d.name != selectedPie.name)
    	{
	    	pieSelected = true;
	    	selectedPie = d;

	    	// "TOTAL" LABEL
		 	totalLabel.text(d.name);
			//TOTAL TRAFFIC VALUE
			totalValue.text((d.value/totalSites*100).toFixed(1) + "%");
			totalValue.attr("font-size",60);
			//UNITS LABEL
			totalUnits.text("OF VISITS");

			d3.selectAll("#piechart .arc path")
		  	.attr("opacity", 0.4)
		  	.attr("stroke","white")
		  	.classed("selected", false);

		  	selectedThis=d3.select(this);
			d3.select(this)
		      	.attr("stroke-width", 2)
		      	.attr("stroke","#333")
		      	.attr("cursor", "pointer")
		      	.attr("opacity", 1)
		      	.classed("selected", true)
		      	.moveToFront();

	    	for(i=0;i<topData.length;i++)
	    	{
	    		if(topData[i][0] == d.name)
	    		{
	    			var barGraphView = new BarGraphView(container,model,model.getDailyTop()[i],1);
	    			var barGraphView = new BarGraphView(container,model,model.getHourlyTop()[i],2);
	    		}
	    	}
	    } 
	    
	    else
    	{	
    		d3.select(this)
		      	.attr("stroke-width", 2)
		      	.attr("stroke","white")
		      	.attr("cursor", "pointer")
		      	.attr("opacity", 1);
    		
    		restore_piechart();
    	}

    }

	function update_center(d)
	{	
		if (pieSelected == true)
	    {
		// "TOTAL" LABEL
		  totalLabel.text(" ");

		//TOTAL TRAFFIC VALUE
		  totalValue.text("Back to total")
		  totalValue.attr("font-size",30)
		  totalValue.attr("dy", 10)
		//UNITS LABEL
		  totalUnits.text(" ");

		  d3.select(this)
		      	.attr("cursor", "pointer");
		}
	}

	function remove_center(d)
	{
		totalValue.attr("font-size",60);
		totalValue.attr("dy", 20)
	}

	function restore_piechart(d)
	{
		pieSelected = false;
		selectedPie = 0;

		// "TOTAL" LABEL
		  totalLabel.text("TOTAL");

		//TOTAL TRAFFIC VALUE
		  totalValue.text(totalSites)
		  totalValue.attr("font-size",60)
		  totalValue.attr("dy", 20);	

		//UNITS LABEL
		  totalUnits.text("VISITS");

		  d3.select("circle")
		  .attr("cursor", "default");

		  d3.selectAll("#piechart .arc path")
		  .attr("stroke", "white")
		  .classed("selected", false);

		  d3.selectAll("path")
		  .attr("opacity", 1);

		// Create bar chart
		var barGraphView = new BarGraphView(container,model,model.getDailyAverages(),1);
		var barGraphView = new BarGraphView(container,model,model.getHourlyAverages(),2);
	}

	// Interpolate the arcs in data space.
	function pieTween(d, i) {
	  var s0;
	  var e0;
	  if(oldPieData[i]){
	    s0 = oldPieData[i].startAngle;
	    e0 = oldPieData[i].endAngle;
	  } else if (!(oldPieData[i]) && oldPieData[i-1]) {
	    s0 = oldPieData[i-1].endAngle;
	    e0 = oldPieData[i-1].endAngle;
	  } else if(!(oldPieData[i-1]) && oldPieData.length > 0){
	    s0 = oldPieData[oldPieData.length-1].endAngle;
	    e0 = oldPieData[oldPieData.length-1].endAngle;
	  } else {
	    s0 = 0;
	    e0 = 0;
	  }
	  var i = d3.interpolate({startAngle: s0, endAngle: e0}, {startAngle: d.startAngle, endAngle: d.endAngle});
	  return function(t) {
	    var b = i(t);
	    return arc(b);
	  };
	}

	// Observer Pattern
	model.addObserver(this);

	this.update = function(args)
	{
		if(args == 'dataReady')
		{
			update();
		}
	}
}
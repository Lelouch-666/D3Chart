/**
 * Created by yaliu on 4/19/2017.
 */
function BubbleChart(chart_id,options){
    var _self = this;//always point to the chart
    _self.chart_id = chart_id;
    
    _self.SetupChartSettings = function(options){
        _self.margin = options.margin || {
                top :  20,
                bottom :  70,
                left: 100,
                right:  20
            };
        _self.width = null;
        _self.height = null;

        //data to be displayed
        _self.data = [];
        _self.tooltip = null;
        _self.title = options.title || "title";

        //our chart
        _self.svg = null;
        if(options.width) _self.width = options.width - _self.margin.left - _self.margin.right;
        if(options.height) _self.height = options.height - _self.margin.top - _self.margin.bottom;
        return _self;
    };

    //create svg chart within chart id provided
    _self.CreateSvg = function(){
        _self.svg = d3.select(_self.chart_id).append("svg")
            .attr("fill", "black")
            .attr("width", _self.width + _self.margin.left + _self.margin.right)
            .attr("height", _self.height + _self.margin.top + _self.margin.bottom).append("g")
            .attr("transform",
                "translate(" + _self.margin.left + "," + _self.margin.top + ")");

        //create chart title
        _self.svg.append("text")
            .attr("class", "chart-title")
            .attr("x", _self.width/2)
            .attr("y", (_self.margin.top/2))
            .attr("text-anchor", "middle")
            .text(_self.title);



        _self.tooltip = d3.select(chart_id).append("div")
            .attr("class", "chart-tooltip")
            .style("opacity", 0);

        return _self;
    };


    _self.Draw = function(input){
        _self.svg.selectAll(".g").remove();
        var data = input.map(function(d){ d.value = +d["amount"]; return d; });
        var color =  d3.scale.category20c();
        var diameter = Math.min(_self.width, _self.height);
        var bubble = d3.layout.pack()
            .sort(null)
            .size([diameter, diameter])
            .padding(1.5);

        //bubbles needs very specific format, convert data to this.
        var nodes = bubble.nodes({children:data}).filter(function(d) { return !d.children; });

        //setup the chart
        var bubbles =  _self.svg.append("g")
            .attr("transform", "translate(0,0)")
            .selectAll(".bubble")
            .data(nodes)
            .enter();

        //create the bubbles
        bubbles.append("circle")
            .attr("class", "chart-circle")
            .attr("r", function(d){ return d.r; })
            .attr("cx", function(d){ return d.x; })
            .attr("cy", function(d){ return d.y; })
            .style("fill", function(d) { return color(d.value); })
            .on('mouseover', function(d){
                _self.tooltip
                    .transition()
                    .duration(100)
                    .style("opacity", .9);
                _self.tooltip.html(  d.name + ":" + d.amount.toLocaleString() )
                    .style("left", d3.select(this).attr("cx") + "px")
                    .style("top", d3.select(this).attr("cy") + "px");
            })
            .on('mouseout', function(d) {
                _self.tooltip
                    .transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        //format the text for each bubble
        bubbles.append("text")
            .style("opacity", function(d) {
                if(d.r < 20) {
                    return 0; // hide text
                } else {
                    return 1; // show text
                }
            }).attr("x", function(d){ return d.x; })
            .attr("y", function(d){ return d.y + 5; })
            .attr("text-anchor", "middle")
            .text(function(d){ return d["name"]; })
            .style({
                "fill":"white",
                "font-family":"Helvetica Neue, Helvetica, Arial, san-serif",
                "font-size": "12px"})
            .on('mouseover', function(d){
                _self.tooltip
                    .transition()
                    .duration(100)
                    .style("opacity", .9);
                _self.tooltip.html( d.name + ":" + d.amount.toLocaleString()  )
                    .style("left", d3.select(this).attr("cx") + "px")
                    .style("top", d3.select(this).attr("cy") + "px");
            })
            .on('mouseout', function(d) {
                _self.tooltip
                    .transition()
                    .duration(500)
                    .style("opacity", 0);
            });

    };

    _self.SetupChartSettings(options)
        .CreateSvg();
    return _self;
};


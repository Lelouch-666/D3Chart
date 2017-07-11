/**
 * Created by yaliu on 8/19/2016.
 * This function will return a realtimeBarChart.
 * You need pass the unique ID of the chart and specify the chart settings in options.
 */
function RealTimeBarChart(chart_id,options){
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
            // set the ranges
        _self.xScale  = null;
        _self.yScale  = null;
        // define the axis
        _self.xAxis = null;
        _self.yAxis = null;

        //data to be displayed
        _self.data = [];
        _self.tooltip = null;
        _self.title = options.title || "title";
        _self.xAxisText = options.xAxisText || '';
        _self.yAxisText = options.yAxisText || '';
        _self.yValueUnits = options.yValueUnits || '';
        _self.svg = null;
        if(options.width) _self.width = options.width - _self.margin.left - _self.margin.right;
        if(options.height) _self.height = options.height - _self.margin.top - _self.margin.bottom;
        return _self;
    };
        //create svg chart within chart id provided
    _self.CreateSvg = function(){
            // create an SVG element inside #myChart div
        _self.svg = d3.select(_self.chart_id).append("svg")
                .attr("fill", "black")
                .attr("width", _self.width + _self.margin.left + _self.margin.right)
                .attr("height", _self.height + _self.margin.top + _self.margin.bottom)
                .append("g")
                .attr("transform",
                    "translate(" + _self.margin.left + "," + _self.margin.top + ")");
            //create chart title
        _self.svg.append("text")
                .attr("class", "chart-title")
                .attr("x", _self.width/2)
                .attr("y", 0 - (_self.margin.top / 2))
                .attr("text-anchor", "middle")
                .text(_self.title);
        _self.tooltip = d3.select(chart_id).append("div")
            .attr("class", "chart-tooltip")
            .style("opacity", 0);
            return _self;
    };
    _self.DrawAxis = function(){
        _self.xScale = d3.scale.ordinal().rangeBands([0, _self.width], 0.1);//could use rangeRoundBands
        _self.yScale  = d3.scale.linear().range([_self.height, 0]);


        // define the axis
        _self.xAxis = d3.svg.axis()
            .scale(_self.xScale)
            .tickFormat(d3.time.format("%H:%M:%S"))
            .orient("bottom");

        _self.yAxis = d3.svg.axis()
            .scale(_self.yScale)
            .orient("left")
            .ticks(10);

        //  X axis text
        _self.svg.append("g")
            .attr("class", "chart-x-axis")
            .attr("transform", "translate(0," + _self.yScale(0) + ")")
            .call(_self.xAxis)
            .append("text")
            .attr("id", "xName-" + _self.guid)
            .attr("x", _self.width / 2)
            .attr("dy", "3em")
            .style("text-anchor", "middle")
            .text(_self.xAxisText);

            // add y axis
        _self.svg.append("g")
                .attr("class", "chart-y-axis")
                .call(_self.yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", -10)
                .attr("x", -_self.height / 2)
                .attr("dy", "-3em")
                .style("text-anchor", "middle")
                .text(_self.yAxisText);
        return this;
    };

    _self.Draw = function(arr){
            _self.data = arr;
            _self.xScale.domain(_self.data.map(function(d) { return d.x_value; }));
            _self.xAxis.tickValues(_self.xScale.domain().filter(function(d, i) { return i % 50 ==0;} ));

            var y_axis_max_height = d3.max(_self.data, function(d) { return d.y_value; }) * 1.2;
            _self.yScale.domain([0,y_axis_max_height]);
            _self.svg.transition().selectAll(".chart-x-axis").call(_self.xAxis);
            _self.svg.transition().selectAll(".chart-y-axis").call(_self.yAxis);

            var bars = _self.svg.selectAll(".chart-bar").data(_self.data, function(d){return d.x_value});

            bars.transition().duration(2000).attr("x", function(d) { return _self.xScale( d.x_value); })
                        .attr("width",_self.xScale.rangeBand())
                        .attr("y", function(d) { return _self.yScale( d.y_value); })
                        .attr("fill", "#fff")
                        .attr("height", function(d) { return _self.height - _self.yScale( d.y_value); });

            bars.exit().transition()
                        .duration(300)
                        .attr("y", _self.yScale(0))
                        .attr("height", _self.height  - _self.yScale(0))
                        .style('fill-opacity', 1e-6)
                        .remove();

            bars.enter().append("rect")
                        .attr("class", "chart-bar")
                        .attr("y", _self.yScale(0))
                        .attr("height",  _self.height  - _self.yScale(0))
                        .on('mouseover', function(d){
  
                            _self.tooltip
                                .transition()
                                .duration(100)
                                .style("opacity", .9);
                            _self.tooltip.html( "<div>"  + d.y_value.toFixed(2) + _self.yValueUnits +  "</div><div>" + moment(d.x_value).format('YYYY/MM/DD HH:mm:ss') + "</div>" )
                                .style("left", (d3.event.pageX - 150) + "px")
                                .style("top", (d3.event.pageY - 120) + "px");
                        })
                        .on('mouseout', function(d) {
                            _self.tooltip
                                .transition()
                                .duration(500)
                                .style("opacity", 0);
                        });

            bars.transition().duration(300).attr("x", function(d) { return _self.xScale(d.x_value); })
                        .attr("width", _self.xScale.rangeBand()) // constant, so no callback function(d) here
                        .attr("y", function(d) { return _self.yScale( d.y_value); })
                        .attr("height", function(d) { return _self.height  - _self.yScale( d.y_value); });

        };
    
    _self.SetupChartSettings(options)
        .CreateSvg()
        .DrawAxis();
    return _self;
};


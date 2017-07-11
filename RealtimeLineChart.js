/**
 * Created by yaliu on 9/23/2016.
 */

function RealTimeLineChart(chart_id, options) {
    var _self = this;

    _self.SetupChartSettings = function(){
        _self.width = options.width || 800;//width of the svg
        _self.height = options.height || 400;//height of the svg
        _self.margin = options.margin || {top: 50, right: 120, bottom: 60, left: 100};
        _self.yDomainMax = options.yDomainMax || null;
        _self.yDomainMin = options.yDomainMin || null;
        _self.yAxisTicks = options.yAxisTicks|| null;
        _self.chart_width = _self.width - _self.margin.left - _self.margin.right; //with of graph
        _self.chart_height = _self.height - _self.margin.top - _self.margin.bottom; //height of graph
        _self.xAxisText = options.xAxisText || '';
        _self.yAxisText = options.yAxisText || '';
        _self.titleText = options.titleText || 'Title';
        _self.yValueUnits = options.yValueUnits || '';
        _self.data = null;
        _self.lineGen = null;
        _self.tooltip = null;
        _self.color = null;
        return _self;
    };

    _self.DrawLegend = function () {
        //set the color for each line
        _self.color = d3.scale.category10();
        _self.color.domain(_self.data.map( function (d) {
            return d.key;
        }));

        _self.Legend = _self.svg.selectAll(".Legend")
            .data(_self.data)
            .enter()
            .append("g")
            .attr("class", "chart-legend");

        _self.Legend.append("circle")
            .attr("r", 4)
            .style("fill", function (d) {
                return _self.color(d.key);
            })
            .style("fill-opacity", .5)
            .style("stroke", function (d) {
                return _self.color(d.key);
            })
            .attr("transform", function (d, i) {
                return "translate(" + (_self.chart_width + 6) + "," + (10 + (i * 20)) + ")";
        });

        _self.Legend.append("text")
            .text(function (d) {
                return d.key;
            })
            .attr("dx", "0.5em")
            .attr("dy", "0.25em")
            .style("text-anchor", "start")
            .attr("transform", function (d, i) {
                return "translate(" + (_self.chart_width + 6) + "," + (10 + (i * 20)) + ")";
            });
        return _self;
    };


    //
    // Draw axis
    //
    _self.DrawAxis = function () {

        //  X,Y Scale
        _self.xScale = d3.time.scale()
            .rangeRound([0, _self.chart_width]);

        _self.yScale = d3.scale.linear()
            .range([_self.chart_height, 0]);

        //  X,Y Axis
        _self.xAxis = d3.svg.axis()
            .scale(_self.xScale)
            .tickFormat(d3.time.format("%H:%M:%S"))
            .orient("bottom");

        _self.yAxis = d3.svg.axis()
            .scale(_self.yScale)
            .orient("left")
            .ticks(_self.yAxisTicks? _self.yAxisTicks : 10)
            .tickSize(-_self.chart_width, 0);

        _self.svg.append("g")
            .classed('chart-y-axis', true)
            .classed('grid', true)
            .call(_self.yAxis);

        //  X axis text
        _self.svg.append("g")
            .attr("class", "chart-x-axis")
            .attr("transform", "translate(0," + _self.yScale(0) + ")")
            .call(_self.xAxis)
            .append("text")
            .attr("x", _self.width / 2)
            .attr("dy", "3em")
            .style("text-anchor", "middle")
            .text(_self.xAxisText);

        // Y axis text
        _self.svg.append("g")
            .attr("class", "chart-y-axis")
            .call(_self.yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0)
            .attr("x", -_self.chart_height / 2)
            .attr("dy", "-3em")
            .style("text-anchor", "middle")
            .text(_self.yAxisText);

        return _self;
    };

    _self.DrawTitle = function () {
        _self.Title = _self.svg.append("text")
            .style("text-anchor", "middle")
            .attr("class", "chart-title")
            .text(_self.titleText)
            .attr("transform", function (d, i) {
                return "translate(" + _self.width / 2 + "," + -10 + ")";
            });
        return _self;
    };

    // Initialize this chart. Anything that doesn't need to be updated real-time
    // should be considered put here.
    _self.CreateSvg = function () {

        //  SVG Canvas
        _self.svg = d3.select(chart_id).append("svg")
            .attr("width", _self.width)
            .attr("height", _self.height)
            .append("g")
            .attr("transform", "translate(" + _self.margin.left + "," + _self.margin.top + ")");

        _self.tooltip = d3.select(chart_id).append("div")
            .attr("class", "chart-tooltip")
            .style("opacity", 0);


        _self.DrawTitle()
            .DrawAxis();
        return _self;
    };
    

    // This function will draw the actual graph.
    // It will first clear the graph.
    // It could be called on an interval basis to get the real-time effect.
    // Sample input :: {KeyOne : [{x1,y1},{x2,y2}], KeyTwo : [{x1,y1},{x2,y2}]}
    _self.Draw = function(arr){
        

        _self.lineGen = d3.svg.line()
            .x(function(d) {  return _self.xScale(d.x_value); })
            .y(function(d) { return _self.yScale(d.y_value); })
            ;


        //Clear our graph before we draw a new graph
        _self.svg.selectAll(".instance").remove();
        _self.svg.selectAll(".chart-legend").remove();

        _self.data = [];
        var x_values = [];
        var y_values = [];
        for (var key in arr) {
            _self.data.push({key: key, values : arr[key]});
            x_values.push(d3.min(arr[key], function(d) { return d.x_value; }));
            x_values.push(d3.max(arr[key], function(d) { return d.x_value; }));
            y_values.push(d3.min(arr[key], function(d) { return d.y_value; }));
            y_values.push(d3.max(arr[key], function(d) { return d.y_value; }));
        }

        if (_self.yDomainMax) y_values.push(_self.yDomainMax);
        if (_self.yDomainMin) y_values.push(_self.yDomainMin);
        
        var min_x_value = d3.min(x_values);
        var max_x_value = d3.max(x_values);
        var min_y_value = d3.min(y_values);
        var max_y_value = d3.max(y_values);

        // After we get the data, we need update our axis and re-draw the chart
        _self.xScale.domain([min_x_value, max_x_value]);
        _self.yScale.domain([min_y_value, max_y_value]);
        _self.svg.transition().selectAll(".chart-x-axis").call(_self.xAxis);
        _self.svg.transition().selectAll(".chart-y-axis").call(_self.yAxis);

        _self.DrawLegend();

        var line = _self.svg.selectAll(".line")
            .data(_self.data)
            .enter()
            .append("g")
            .attr("class", "instance");

        line.append("path")
            .attr("class", "line")
            .style("fill", "none")//we don't want to fill here
            .attr("d", function(d) { return _self.lineGen(d.values); })
            .style("stroke", function(d) { return _self.color(d.key); });

        line.append("text")
            .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
            .attr("transform", function(d) { return "translate(" + _self.xScale(d.value.x_value) + "," + _self.yScale(d.value.y_value) + ")"; })
            .attr("x", 3)
            .attr("dy", ".35em")
            .text(function(d) { return d.name; });

        line.selectAll("circle")
            .data(function(d){return d.values})
            .enter()
            .append("circle")
            .attr("r", 2)
            .attr("cx", function(d) { return _self.xScale(d.x_value); })
            .attr("cy", function(d) { return _self.yScale(d.y_value); })
            .style("fill", function(d) { return _self.color(d.name); })
            .on('mouseover', function(d){
                _self.tooltip
                    .transition()
                    .duration(100)
                    .style("opacity", .9);
                _self.tooltip.html( "<div>" + d.name + " : " + d.y_value + _self.yValueUnits + "</div>"
                    + "<div>" +  moment(d.x_value).format('YYYY/MM/DD HH:mm:ss') + "</div>" )
                    .style("left", (d3.event.pageX - 150) + "px")
                    .style("top", (d3.event.pageY - 120) + "px");
            })
            .on('mouseout', function(d) {
                _self.tooltip
                    .transition()
                    .duration(500)
                    .style("opacity", 0);
            });
    };


    // Before we return this chart instance, we need to
    // initialize it.
    _self.SetupChartSettings()
        .CreateSvg();

    return _self;
}

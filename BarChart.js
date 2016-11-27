function BarChart(chart_id,options){
    var _self = this;//always point to the chart

    _self.setupChartSettings = function(options){
        _self.margin = options.margin || {
                top :  20,
                bottom :  70,
                left: 100,
                right:  20
            };
        _self.width = options.width||600;
        _self.height = options.height||400;
            // set the ranges
        _self.xScale  = null;
        _self.yScale  = null;
        
        // define the axis
        _self.xAxis = null;
        _self.yAxis = null;
        _self.yDomainMax = options.yDomainMax || null;
        
        //data to be displayed
        _self.data = [];
        _self.tooltip = null;
        _self.titleText = options.titleText || "title";
        _self.xAxisText = options.xAxisText || '';
        _self.yAxisText = options.yAxisText || '';
        
            //our chart
        _self.svg = null;
        if(options.width) _self.width = options.width - _self.margin.left - _self.margin.right;
        if(options.height) _self.height = options.height - _self.margin.top - _self.margin.bottom;
        return _self;
    };
        //create svg chart within chart id provided
    _self.createSvg = function(chart_id){
            // create an SVG element inside #myChart div
        _self.svg = d3.select(chart_id).append("svg")
                .attr("fill", "black")
                .attr("width", _self.width + _self.margin.left + _self.margin.right)
                .attr("height", _self.height + _self.margin.top + _self.margin.bottom)
                .append("g")
                .attr("transform",
                    "translate(" + _self.margin.left + "," + _self.margin.top + ")");
            //create chart title
        _self.svg.append("text")
                .attr("class", "title")
                .attr("x", _self.width/2)
                .attr("y", 0 - (_self.margin.top / 2))
                .attr("text-anchor", "middle")
                .text(_self.titleText);


        return _self;
    };
    _self.drawAxis = function(){
        _self.xScale = d3.scale.ordinal().rangeBands([0, _self.width], 0.05);//could use rangeRoundBands
        _self.yScale  = d3.scale.linear().range([_self.height, 0]);
        // define the axis
        _self.xAxis = d3.svg.axis()
            .scale(_self.xScale)
            .orient("bottom");
        _self.yAxis = d3.svg.axis()
            .scale(_self.yScale)
            .orient("left")
            .ticks(10);

        //  X axis text
        _self.svg.append("g")
            .attr("class", "x axis")
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
                .attr("class", "y axis")
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

    _self.draw = function(arr){
        
            _self.data = arr;

            _self.xScale.domain(_self.data.map(function(d) { return d.x_value; }));
            var y_axis_max_height =  _self.yDomainMax || d3.max(_self.data, function(d) { return d.y_value; }) * 1.2;
                //xScale.domain([0,12]);
            _self.yScale.domain([0,y_axis_max_height]);
            _self.svg.transition().selectAll("g.x.axis").call(_self.xAxis);
            _self.svg.transition().selectAll("g.y.axis").call(_self.yAxis);

                // Add bar chart
            _self.svg.selectAll(".instance").remove();

            var bar_instance =  _self.svg.selectAll(".bar")
                .data(_self.data)
                .enter()
                .append("g")
                .attr("class", "instance");
            bar_instance
                .append("rect")
                .attr("class", "barChart-bar-color")
                .attr("x", function(d) { return _self.xScale( d.x_value); })
                .attr("width",_self.xScale.rangeBand())
                .attr("y", function(d) { return _self.yScale( d.y_value); })
                .attr("fill", "#fff")
                .attr("height", function(d) { return _self.height - _self.yScale( d.y_value); });
            bar_instance
                .append("text")
                .text(function(d) {
                    return d.y_value+"%";
                })
                .attr("x", function(d) {
                    return _self.xScale( d.x_value) + _self.xScale.rangeBand()/2;  // +5
                })
                .attr("y", function(d) {
                    return _self.yScale( d.y_value) - 15;              // +15
                })
                .attr("class", "barChart-text");
        };
    
    _self.setupChartSettings(options)
        .createSvg(chart_id)
        .drawAxis();
    return _self;
};

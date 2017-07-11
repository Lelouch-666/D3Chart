/**
 * Created by yaliu on 4/11/2017.
 */

function PieChart(chart_id,options){
    var _self = this;//always point to the chart
    _self.chart_id = chart_id;
    _self.options = options || {
            title : "title",
             margin : {
                 top :  30,
                 bottom :  10,
                 left: 10,
                 right:  10
            },
            canvas_width : 280,
            canvas_height : 280,
            pie_radius : 140
    };

    _self.SetupChartSettings = function(options){

        _self.width = _self.options.canvas_width + _self.options.margin.left + _self.options.margin.right;
        _self.height = _self.options.canvas_height + _self.options.margin.top + _self.options.margin.bottom;
        _self.arc = d3.svg.arc()
            .outerRadius(_self.options.pie_radius - 10)
            .innerRadius(0);
        _self.pie = d3.layout.pie()
            .sort(null)
            .value(function(d) {
                return d.count;
        });


        _self.svg = d3.select(_self.chart_id).append("svg")
            .attr("width", _self.width)
            .attr("height",  _self.height);

        _self.title = _self.svg.append("g")
            .attr("transform", "translate(" + _self.width / 2 + "," + _self.options.margin.top / 2 + ")")
            .append("text")
            .attr("class", "chart-title")
            .attr("text-anchor", "middle")
            .text(_self.options.title);

        _self.tooltip = _self.svg.append("g")
            .append("text")
            .attr("transform", "translate(" + _self.width / 2 + "," + _self.options.margin.top / 2 + ")");

        _self.canvas = _self.svg.append("g")
            .attr("transform", "translate(" + _self.width / 2 + "," + _self.height / 2 + ")");


        return _self;
    };

    function tweenPie(b) {
        b.innerRadius = 0;
        var i = d3.interpolate({startAngle: 0, endAngle: 0}, b);
        return function(t) { return _self.arc(i(t)); };
    }

    //create svg chart within chart id provided
    _self.Draw = function(data){
        _self.canvas.selectAll("g g").remove().transition().duration(750);
        var g = _self.canvas.selectAll(".arc")
            .data(_self.pie(data))
            .enter().append("g").on('mouseover', function(d){
                _self.tooltip
                    .transition()
                    .duration(100)
                    .style("opacity", .9);
                _self.tooltip.text(d.data.name)
                    .attr("transform", "translate(" + d3.event.pageX  + "," + d3.event.pageY  + ")");
            })
            .on('mouseout', function(d) {
                _self.tooltip
                    .transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        g.append("path")
            .attr("d", _self.arc)
            .style("fill", function(d,i) {
                return d.data.color;
            });

        g.append("text")
            .attr("transform", function(d) {
                var _d = _self.arc.centroid(d);
                return "translate(" + _d  + ")";
            })
            .style("font-size", "12px")
            .style("font-weight", "700")
            .attr("dy", ".50em")
            .style("text-anchor", "middle")
            .text(function(d) {
                return  d.data.label;
            })
            .transition()
            .duration(1000)
            .style("fill", "blue")
            .transition()
            .duration(1000)
            .style("fill", "black");
        return _self;
    };


    _self.SetupChartSettings(options);
    return _self;
};

 $(document).ready(function(){
    $('ul.nav li.dropdown').hover(function() {
      $(this).find('.dropdown-menu').stop(true, true).delay(200).fadeIn(500);
    }, function() {
      $(this).find('.dropdown-menu').stop(true, true).delay(200).fadeOut(500);
    });

    $('.nav-side-menu ul li').click(function(){
        $('.nav-side-menu ul li').removeClass("active");
        $(this).addClass("active");
    })

    $(".main-container").hide();
    $(".graph-container").hide();
    $("#graph").change(function(){
        showGraph();
    });
    $("#company").change(function(){
         $('.breadcrum span').html("Dashboard (Company Analysis) &nbsp;&nbsp;>&nbsp;&nbsp; "+ $("#company").val());
        showGraph()
    });
 });

 function showGraph(){
    $(".graph-container").hide();
    $(".graph-container svg").empty();
    var company = $("#company").val()
    var graph = $("#graph").val()
    if(company.length>0 && graph.length>0){
        if(graph.indexOf("Segment")!=-1)
        {
            if(company.indexOf("AAPL")!=-1){
                convertSegment("../data/AAPL_2016.csv");
            } else {
                convertSegment("../data/GOOGL_2016.csv");
            }
        } else {
            if(company.indexOf("AAPL")!=-1){
                convertPVdata("../data/AAPL_SP_V.csv");
            } else {
                convertPVdata("../data/GOOGL_SP_V.csv");
            }
        }
        $(".graph-container").show();
    }
 }

function convertPVdata(file){
    var dataValues = [];
    d3.csv(file, function(data){
        var volumes = [];
        var sharePrices = [];
        for(var i=0;i<data.length;i++){
            volumes.push({x:(new Date(data[i]["Date"])).getTime(),y:parseFloat(data[i]["Volume"])})
            sharePrices.push({x:(new Date(data[i]["Date"])).getTime(),y:parseFloat(data[i]["Close"])})
        }
        dataValues.push({key:"Volume", bar:true, values:volumes})
        dataValues.push({key:"Share Price", values:sharePrices})
        drawPV(dataValues);
    });
}


function convertSegment(file){
    var dataValues = [];
    d3.csv(file, function(data){
        for(var i=0;i<data.length;i++){
            dataValues.push({key:data[i]["Geography"],y:parseFloat(data[i]["Revenue"])});
        }
        drawSegmentChart(dataValues);
    });
}

function drawPV(data){
     nv.addGraph(function() {
        chart = nv.models.linePlusBarChart()
            .margin({top: 50, right: 80, bottom: 30, left: 80})
            .color(d3.scale.category10().range())
            .legendRightAxisHint('');
        chart.xAxis.tickFormat(function(d) {
            return d3.time.format('%x')(new Date(d))
        }).showMaxMin(false);

        chart.y2Axis.tickFormat(function(d) { return '$' + d3.format(',f')(d) });
        chart.y1Axis.tickFormat(function(d) { return d3.format(',f')(d) });
        chart.bars.forceY([0]).padData(false);

        chart.x2Axis.tickFormat(function(d) {
            return d3.time.format('%x')(new Date(d))
        }).showMaxMin(false);

        d3.select('.graph-container svg')
            .datum(data)
            .transition().duration(500).call(chart);

        nv.utils.windowResize(chart.update);

        chart.dispatch.on('stateChange', function(e) { nv.log('New State:', JSON.stringify(e)); });

        return chart;
    });
}


function drawSegmentChart(data){
    nv.addGraph(function() {
        var sum=0;
        for(var i=0;i<data.length;i++)
            sum+=data[i].y;
        var chart1 = nv.models.pieChart()
            .x(function(d) { return d.key})
            .y(function(d) { return d.y })
            .donut(true)
            .labelType(function(d){ return d.data.key + " (" +d3.format(',.2f')(d.data.y/sum*100)+"%)"  })


        chart1.title("Total Revenue: $"+d3.format(',f')(sum));
        chart1.pie.labelsOutside(true).donut(true);

        d3.select(".graph-container svg")
            .datum(data)
            .transition().duration(1200)
            .call(chart1);

        return chart1;

    });
}

function reset(){
    $(".main-container").show();
    $(".graph-container").hide();
    $(".graph-container svg").empty();
    $("#company").val('default');
    $("#company").selectpicker("refresh");
    $("#graph").val('default');
    $("#graph").selectpicker("refresh");
    $('.breadcrum span').html("Dashboard (Company Analysis)");
}

function hideAll(){
    $(".main-container").hide();
}
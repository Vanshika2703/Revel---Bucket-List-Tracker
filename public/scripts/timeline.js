var clientWidth = 500;

$(window).resize(function() {
    clientWidth = document.getElementById('timelineNonDate').clientWidth;
    console.log(clientWidth);
});

    var nonDatedata = [
     {"value": 224, "name": "Player 1" },
     {"value": 249, "name": "Player 2" },
     {"value": 297, "name": "Player 3" },
     {"value": 388, "name": "Player 4" },
     {"value": 397, "name": "Player 5" },
     {"value": 418, "name": "Player 6" }
    ];
    TimeKnots.draw("#timelineNonDate", nonDatedata, {dateDimension:false, color: "teal", width:500, showLabels: true, labelFormat: "%Y"});
    
    
    
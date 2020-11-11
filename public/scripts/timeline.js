var clientWidth = 500;

$(window).resize(function() {
    clientWidth = document.getElementById('timelineNonDate').clientWidth;
    console.log(clientWidth);
});

var kurbickFilms = [{name:"Day of the Fight", date: "1951-04-26", img: "http://upload.wikimedia.org/wikipedia/en/thumb/c/c4/Day_of_the_Fight_title.jpg/215px-Day_of_the_Fight_title.jpg"},
{name:"The Seafarers", 	date:"1953-10-15", img: "http://upload.wikimedia.org/wikipedia/en/thumb/6/6c/Seafarers_title.jpg/225px-Seafarers_title.jpg"},
{name:"Lolita (1962 film)", 	date:"1962-06-13", img: "http://upload.wikimedia.org/wikipedia/en/thumb/7/72/LolitaPoster.jpg/215px-LolitaPoster.jpg"},
{name:"Fear and Desire", date:	"1953-03-31", img: "http://upload.wikimedia.org/wikipedia/en/f/f7/Fear_and_Desire_Poster.jpg"},
{name:"Paths of Glory", date:	"1957-12-25", img: "http://upload.wikimedia.org/wikipedia/en/thumb/b/bc/PathsOfGloryPoster.jpg/220px-PathsOfGloryPoster.jpg"},
{name:"A Clockwork Orange (film)", date:	"1971-12-19", img: "http://upload.wikimedia.org/wikipedia/en/thumb/4/48/Clockwork_orangeA.jpg/220px-Clockwork_orangeA.jpg"},
{name:"Killer's Kiss", date:	"1955-09-28", img: "http://upload.wikimedia.org/wikipedia/en/thumb/a/a6/KillersKissPoster.jpg/220px-KillersKissPoster.jpg"}
];

TimeKnots.draw("#timelineNonDate", kurbickFilms, {dateFormat: "%B %Y", color: "teal", width:500, showLabels:false, labelFormat: "%Y"});
    
    
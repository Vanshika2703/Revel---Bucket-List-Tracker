
   //playing around with prototyping. This way of doing it is highly discouraged and is a part of experimentation

  
  
   if( typeof Element.prototype.clearChildren === 'undefined' ) {
      Object.defineProperty(Element.prototype, 'clearChildren', {
        configurable: true,
        enumerable: false,
        value: function() {
          while(this.firstChild) this.removeChild(this.lastChild);
        }
      });
  }



function htmlToElement(html) {
  var template = document.createElement('template');
  template.innerHTML = html;
  return template.content.firstChild;
}

var TimeKnots = {
  draw: function(id, events, options){
    var cfg = {
      width: 600,
      height: 200,
      radius: 10,
      lineWidth: 4,
      color: "#999",
      background: "#FFF",
      dateFormat: "%Y/%m/%d %H:%M:%S",
      horizontalLayout: true,
      showLabels: false,
      labelFormat: "%Y/%m/%d %H:%M:%S",
      addNow: false,
      seriesColor: d3.scale.category20(),
      dateDimension: true
    };

    //default configuration overrid
    if(options != undefined){
      for(var i in options){
        cfg[i] = options[i];
      }
    }
    if(cfg.addNow != false){
      events.push({date: new Date(), name: cfg.addNowLabel || "Today"});
    }
    var tip = d3.select(id)
    .append('div')
    .style("opacity", 0)
    .style("position", "absolute")
    .style("font-family", "Helvetica Neue")
    .style("font-weight", "300")
    .style("background","rgba(0,0,0,0.5)")
    .style("color", "white")
    .style("padding", "5px 10px 5px 10px")
    .style("-moz-border-radius", "8px 8px")
    .style("border-radius", "8px 8px");
    var svg = d3.select(id).append('svg').attr("width", cfg.width).attr("height", cfg.height);
    //Calculate times in terms of timestamps
    if(!cfg.dateDimension){
      var timestamps = events.map(function(d){return  d.value});//new Date(d.date).getTime()});
      var maxValue = d3.max(timestamps);
      var minValue = d3.min(timestamps);
    }else{
      var timestamps = events.map(function(d){return  Date.parse(d.date);});//new Date(d.date).getTime()});
      var maxValue = d3.max(timestamps);
      var minValue = d3.min(timestamps);
    }
    var margin = (d3.max(events.map(function(d){return d.radius})) || cfg.radius)*1.5+cfg.lineWidth;
    var step = (cfg.horizontalLayout)?((cfg.width-2*margin)/(maxValue - minValue)):((cfg.height-2*margin)/(maxValue - minValue));
    var series = [];
    if(maxValue == minValue){step = 0;if(cfg.horizontalLayout){margin=cfg.width/2}else{margin=cfg.height/2}}

    linePrevious = {
      x1 : null,
      x2 : null,
      y1 : null,
      y2 : null
    }
    console.log(events);
    svg.selectAll("line")
    .data(events).enter().append("line")
    .attr("class", "timeline-line")
      .attr("x1", function(d){
                      var ret;
                      if(cfg.horizontalLayout){
                        var datum = (cfg.dateDimension)?new Date(d.date).getTime():d.value;
                        ret = Math.floor(step*(datum - minValue) + margin)
                      }
                      else{
                        ret = Math.floor(cfg.width/2)
                      }
                      linePrevious.x1 = ret
                      return ret
                      })
    .attr("x2", function(d){
                      if (linePrevious.x1 != null){
                          return linePrevious.x1
                      }
                      if(cfg.horizontalLayout){
                        var datum = (cfg.dateDimension)?new Date(d.date).getTime():d.value;
                        ret = Math.floor(step*(datum - minValue ))
                      }
                      return Math.floor(cfg.width/2)
                      })
    .attr("y1", function(d){
                      var ret;
                      if(cfg.horizontalLayout){
                        ret = Math.floor(cfg.height/2)
                      }
                      else{
                        var datum = (cfg.dateDimension)?new Date(d.date).getTime():d.value;
                        ret = Math.floor(step*(datum - minValue)) + margin
                      }
                      linePrevious.y1 = ret
                      return ret
                      })
    .attr("y2", function(d){
                      if (linePrevious.y1 != null){
                        return linePrevious.y1
                      }
                      if(cfg.horizontalLayout){
                        return Math.floor(cfg.height/2)
                      }
                      var datum = (cfg.dateDimension)?new Date(d.date).getTime():d.value;
                      return Math.floor(step*(datum - minValue))
                      })
    .style("stroke", function(d){
                      if(d.color != undefined){
                        return d.color
                      }
                      if(d.series != undefined){
                        if(series.indexOf(d.series) < 0){
                          series.push(d.series);
                        }
                        return cfg.seriesColor(series.indexOf(d.series));
                      }
                      return cfg.color})
    .style("stroke-width", cfg.lineWidth);

    console.log('events before circle init  ', events);
    svg.selectAll("circle")
    .data(() => {
      let vals = Object.values(events.reduce((prev, next) => {console.log(next);
      if(!prev[next.date.getYear()+"-"+next.date.getMonth()]){
        console.log("wtf");
        return {...prev, [next.date.getYear()+"-"+next.date.getMonth()]:[next]};
      }
      else{
        console.log("wtf2");
        (prev[next.date.getYear()+"-"+next.date.getMonth()]).push(next);
        return prev;
      }},{}))
      console.log("wtfme ", vals);
      return vals;
    }).enter()
    .append("circle")
    .attr("class", "timeline-event")
    .attr("r", function(d){if(d.radius != undefined){return d.radius} return cfg.radius})
    .style("stroke", function(d){
                    if(d.color != undefined){
                      return d.color
                    }
                    if(d.series != undefined){
                      if(series.indexOf(d.series) < 0){
                        series.push(d.series);
                      }
                      console.log(d.series, series, series.indexOf(d.series));
                      return cfg.seriesColor(series.indexOf(d.series));
                    }
                    return cfg.color}
    )
    .style("stroke-width", function(d){if(d.lineWidth != undefined){return d.lineWidth} return cfg.lineWidth})
    .style("fill", function(d){if(d.background != undefined){return d.background} return cfg.background})
    .attr("cy", function(d){
        if(cfg.horizontalLayout){
          return Math.floor(cfg.height/2)
        }
        var datum = (cfg.dateDimension)?new Date(d[0].date).getTime():d[0].value;
        return Math.floor(step*(datum - minValue) + margin)
    })
    .attr("cx", function(d){
        if(cfg.horizontalLayout){
          var datum = (cfg.dateDimension)?new Date(d[0].date).getTime():d[0].value;
          var x=  Math.floor(step*(datum - minValue) + margin);
          return x;
        }
        return Math.floor(cfg.width/2)
    }).on("mouseover", function(d){
      
      if(cfg.dateDimension){
        var format = d3.time.format(cfg.dateFormat);
        var datetime = format(new Date(d[0].date));
        var dateValue = (" <small>("+datetime+")</small>");
      }else{
        var format = function(d){return d}; // TODO
        var datetime = d[0].date;
        var dateValue = " <small>("+d[0].date+")</small>";
      }
      d3.select(this)
      .style("fill", function(d){if(d.color != undefined){return d.color} return cfg.color}).transition()
      .duration(100).attr("r",  function(d){if(d.radius != undefined){return Math.floor(d.radius*1.5)} return Math.floor(cfg.radius*1.5)});
      tip.html("");
      tip.append("div").style("float", "left").html(dateValue );
      tip.transition()
      .duration(100)
      .style("opacity", .9);

    })
    .on("click", function(d1) {
      console.log(d1);
      let container = document.getElementById("cardsContainer");
      container.clearChildren();
      d1.forEach(d => {
        const inputElem = htmlToElement(`<div class="card">
        <div class="card-title">
          <h4 class="item-desc">${d.name}</h4>
          <h6>${d.date.toString().substring(0, d.date.toString().length - 33)}</h6>
        </div>
        <div class="card-body">
        </div>
       </div>`);
      if(d.img!=""){
      const pictureElem = htmlToElement(`<div class="imgHolder">
        <img src="">
      </div>`);
      inputElem.querySelector(".card-body").appendChild(pictureElem);
      console.log(d.img);
			revel.fbTimelineController.getImageUrl(d.img, url => pictureElem.querySelector("img").src = url);
    } console.log(d.journal);
    if(!(d.journal===undefined)){
      inputElem.childNodes[1].appendChild(htmlToElement(`<div class="journalInput">${d.journal}
      </div>`))  }
      container.appendChild(inputElem)
      });
    
    //  if(cfg.dateDimension) {
    //   var format = d3.time.format(cfg.dateFormat);
    //   var datetime = format(new Date(d.date));
    //   var dateValue = (" <small>("+datetime+")</small>");
    // } else {
    //   var format = function(d){return d}; // TODO
    //   var datetime = d.date;
    //   var dateValue = " <small>("+d.date+")</small>";
    // }

    // d3.select(this)
    // .style("fill", function(d){if(d.color != undefined){return d.color} return cfg.color}).transition()
    // .attr("r",  function(d){if(d.radius != undefined){return Math.floor(d.radius*1.5)} return Math.floor(cfg.radius*1.5)});
    // tip.html("");
    // tip.append("div").style("float", "left").html(dateValue );
    // tip.transition()
    // .style("opacity", .9);
    // 
  })
    .on("mouseout", function(){
        d3.select(this)
        .style("fill", function(d){if(d.background != undefined){return d.background} return cfg.background}).transition()
        .attr("r", function(d){if(d.radius != undefined){return d.radius} return cfg.radius});
        tip.transition()
    .style("opacity", 0)});

    //Adding start and end labels
    if(cfg.showLabels != false){
      if(cfg.dateDimension){
        var format = d3.time.format(cfg.labelFormat);
        var startString = format(new Date(minValue));
        var endString = format(new Date(maxValue));
      }else{
        var format = function(d){return d};
        var startString = minValue;
        var endString = maxValue;
      }
      svg.append("text")
         .text(startString).style("font-size", "70%")
         .attr("x", function(d){if(cfg.horizontalLayout){return d3.max([0, (margin-this.getBBox().width/2)])} return Math.floor(this.getBBox().width/2)})
         .attr("y", function(d){if(cfg.horizontalLayout){return Math.floor(cfg.height/2+(margin+this.getBBox().height))}return margin+this.getBBox().height/2});

      svg.append("text")
         .text(endString).style("font-size", "70%")
         .attr("x", function(d){if(cfg.horizontalLayout){return  cfg.width -  d3.max([this.getBBox().width, (margin+this.getBBox().width/2)])} return Math.floor(this.getBBox().width/2)})
         .attr("y", function(d){if(cfg.horizontalLayout){return Math.floor(cfg.height/2+(margin+this.getBBox().height))}return cfg.height-margin+this.getBBox().height/2})
    }


    svg.on("mousemove", function(){
        tipPixels = parseInt(tip.style("height").replace("px", ""));
    return tip.style("top", (d3.event.pageY-tipPixels-margin)+"px").style("left",(d3.event.pageX+20)+"px");})
   .on("mouseout", function(){return tip.style("opacity", 0).style("top","0px").style("left","0px");});
    }
  }


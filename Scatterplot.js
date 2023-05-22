let articleData;
let dates;
let svg;

//Determines dates through datapicker in HTML
function testing(startingdate, endingdate) {
  console.log(startingdate);
  console.log(endingdate);
  dates = [startingdate, endingdate];
  fetchData();
}

function fetchData() {
  if (!dates) {
    console.log("Dates are not defined yet"); //Graph is empty if there is no data yet
    return;
  }

  fetch('Baselvotesdata.json')
    .then(response => response.json())
    .then(data => {
      articleData = data;
      console.log(dates);

    //filtering Data so it only shows the right years
    const filteredData = articleData.filter(d => {
      const jahr = parseInt(d.jahr);
      return jahr >= dates[0] && jahr <= dates[1];
    });
    console.log(filteredData);

    // Remove existing chart
    d3.select("#plotSVG").selectAll("*").remove();
    
    // getting the Years with no vote into the noVoteBox
    const NoVoteYears = [1878, 1879, 1880, 1883, 1885, 1886, 1888, 1892, 1893, 1894, 1895, 1908, 1917, 1919, 1956, 1997]
    $(document).ready(function() {
      fetch('ImportantDates.json')
        .then(response => response.json())
        .then(impDates => {
          const importantDates = impDates;
          var missingYears = NoVoteYears.filter(num => num > dates[0] && num < dates[1]);
          var impDateshere = importantDates.filter(date => date.year > dates[0] && date.year < dates[1]);
    
          var title = '<h6> Gewählte Jahre: <span class="bold">' + dates[0] + '-' + dates[1] + '</span></h6>'
          var noVoteBox = (missingYears.length > 0 ? '<p><span class =bold>Jahre ohne Abstimmung im gewählten Zeitraum: </span><br>' + missingYears.map(year => '<img src="https://img.icons8.com/wired/100/cancel--v3.png" alt="Icon" width="25" height="25" style="margin-bottom: 2px;">' + year).join('<br>') + '</p>' : 'Keine Jahre ohne Abstimmung im gewählten Zeitraum');
          var historicInfo = (impDateshere.length > 0 ? '<span class=bold> Wichtige historische Daten für die Schweiz: </span><br>' + impDateshere.map(date => date.icon + ' ' + date.year + ': ' + date.event).join('<br>') : '');

    
          $('#chosen-years').html(title);
          $('#date-info').html(noVoteBox);
          $('#historic-info').html(historicInfo);

          if (dates[0] && dates[1]) {
            $('#noVoteBox').show();
            $('#historicBox').show();
          }
      })
    });


    if (dates[0] && dates[1]) {
      $('#select-x-var').show();
    }

    let svg = d3.select("#plotSVG")
      .style("overflow","visible") // some tooltips stray outside the SVG border
      .append("g")
      .attr("transform", "translate(50,50)")

    let xScale = d3.scaleLinear()
      .domain([0, 1])   
      .range([0, 500]);  

      
    let yScale = d3.scaleLinear()
      .domain([0, 1])   // my y-variable has a max of 1
      .range([400, 0]);   // my y-axis is 400px high
                          // (the max and min are reversed because the 
                          // SVG y-value is measured from the top)

    let yVar = "stimmbeteiligung";


    // Add y-axis title
    svg.append("text")
    .attr("x", -260)  // Adjust the x-coordinate to position the title to the left of the y-axis
    .attr("y", -60)  // Position the title vertically
    .attr("transform", "rotate(-90)")  // Rotate the text by -90 degrees for vertical orientation
    .text("Stimmbeteiligung")
    .style('font-weight', 'bold');  

    let pubColors = {
        "Fakultatives Referendum": "#ff5982",
        "Gegenentwurf des Grossen Rates": "#8d42b9",
        "Initiative": "#8ac926",
        "Angeordnete Abstimmung": "#1982c4",
        "Obligatorische Abstimmung": "#683a1d"
    }

    svg.append("g")       // the axis will be contained in an SVG group element
      .attr("id","yAxis")
      .call(d3.axisLeft(yScale)
              .ticks(5)
              .tickFormat(d3.format(".0%"))
              .tickSizeOuter(0)
          )
      
    svg.append("g")       
      .attr("transform", "translate(0,400)")    // translate x-axis to bottom of chart
      .attr("id","xAxis")
      .call(d3.axisBottom(xScale)
              .ticks(5)
              .tickFormat(d3.format(".0%"))
              .tickSizeOuter(0)
          )

    
    svg.selectAll(".bubble")
      .data(filteredData)    // bind each element of the data array to one SVG circle
      .join("circle")
      .attr("class", "bubble")
      .attr("cx", d => xScale(d.ja_anteil))   
      .attr("cy", d => yScale(d.stimmbeteiligung))  
      .attr("r", 7)  
      .attr("stroke",  d => pubColors[d.vorlagentyp])
      .attr("fill", d =>  pubColors[d.vorlagentyp])  
      .attr("fill-opacity", 0.5)
      .on("mouseover",(e,d) => {    // event listener to show tooltip on hover
        d3.select("#bubble-tip-"+d.bs_id)  // bs_id is an unique ID
          .style("display","block");
      })
      .on("mouseout", (e,d) => {    // event listener to hide tooltip after hover
        if(!d.toolTipVisible){
          d3.select("#bubble-tip-"+d.bs_id)
            .style("display","none");
        }
      })
      .on("click", (function(d) { //Making an infobox on click

        // Get the data for the clicked bubble
        var data = d3.select(this).datum();
        
        // Determine the tooltip based on vorlagentyp
        const TextInitiative = "Stimmberechtigte können eine Initiative mit dem Begehren auf Erlass, Änderung oder Aufhebung von Verfassungs- und Gesetzesbestimmungen oder eines Grossratsbeschlusses einreichen."
        const TextReferendum = "Wenn innerhalb von 42 Tagen ab Publikation des Beschlusses im Kantonsblatt genügend Unterschriften gesammelt werden, muss über das Gesetz oder die Gesetzesänderung abgestimmt werden."
        const TextGegenentwurf = "Der grosse Rat schlägt als Antwort auf die Initiative einen anderen Verfassungsartikel vor. Zieht das Initiativkomitee die Initiative nicht zurück, so gelangt der Gegenentwurf gleichzeitig mit der Initiative zur Abstimmung."
        const TextObligatorisch = "Beschlüsse, welche zwingend eine Volksabstimmung erfordern. Unter anderem Staatsverträge mit verfassungsänderndem Inhalt und Änderungen des Kantonsgebiets. Der Grosse Rat kann den Stimmberechtigten freiwillig weitere Vorlagen zur Abstimmung vorlegen."
        
        let tooltipTitle;
        if (data.vorlagentyp === "Initiative") {
          tooltipTitle = TextInitiative;
        } else if (data.vorlagentyp === "Fakultatives Referendum") {
          tooltipTitle = TextReferendum;
        } else if (data.vorlagentyp === "Gegenentwurf des Grossen Rates") {
          tooltipTitle = TextGegenentwurf;
        } else if (data.vorlagentyp === "Obligatorische Abstimmung") {
          tooltipTitle = TextObligatorisch;
        }
        // Set the content of the info box's left side (Text)
        var contentLeft =
        '<h5>' + data.titel + '</h5>' +
        '<p> <strong> Jahr:</strong> ' +data.jahr + '</p>' +
        '<p> <strong> Thema:</strong> ' +data.thema + '</p>' +
        '<p> <strong> Unterthema:</strong> ' +data.unterthema + '</p>' +
        '<p> <strong> Vorlagentyp:</strong> ' +
        '<span class="vorlagentyp-color" data-toggle="tooltip" data-placement="right" title="' + tooltipTitle + '"  data-class="tooltip-custom">' + data.vorlagentyp + '</span>' +
        '</p>' +
        (data.kurzbeschrieb ? '<p> <strong>Kurzbeschrieb: </strong>' + data.kurzbeschrieb + '</p>' : '') +
        (data.link ? '<p> <strong>Download: </strong> <a href=' + data.link + 'target="_blank">Abstimmungserläuterung</a></p>' : '');
        $('#text-side').html(contentLeft);

        //set the content of the info box's right side (Pie Chart)
        //Pie chart for Abstimmungsergebnis
        var chrt = document.getElementById("chartId").getContext("2d");
        var chartId = new Chart(chrt, {
          type: 'pie',
          data: {
              labels: ["Ja-Anteil", "Nein-Anteil"],
              datasets: [{
                label: "Abstimmungsergebnis",
                data: [data.ja_anteil * 100, (1 - data.ja_anteil) * 100],
                backgroundColor: ['#17cb5fff', '#f85454'],
                hoverOffset: 5,
              }],
          },
          options: {
              responsive: false,
              plugins: {
                legend: {
                display: false
                },
                tooltip: {
                  boxWidth: 10,
                  boxHeight: 10,
                },
                title: {
                  display: true,
                  text: 'Abstimmungsergebnis'
                }
              }
          },
        });

        //set the content of the info box's right side (Unterschied)
        var contentRight =
        '<strong>' + data.unterschied +
        '</strong> Stimmen haben den Unterschied gemacht!' +
        '<p> Das sind <strong>' + data.entscheidender_anteil.toFixed(2) +
        '%</strong> der Stimmberechtigen an diesem Zeitpunkt. </p>'
        ;
        
        $('#info-side').html(contentRight, chartId);

        

        $(document).ready(function() {
          $('#infobox').on('shown.bs.modal', function() {
            // Start the animation again with the new percentage value
            startAnimation((data.stimmbeteiligung * 100).toFixed(1));
          });
          $(function () {
            $('[data-toggle="tooltip"]').tooltip({
              template: '<div class="tooltip tooltip-custom" role="tooltip"><div class="arrow"></div><div class="tooltip-inner"></div></div>'
            });
          });
        })
       

        // Show the info box
        $('#infobox').modal('show');

        //destoys canvas so the Abstimmungsergebnis Chart can be loaded again
        $('#infobox').on('hidden.bs.modal', function () {
          chartId.destroy(); 
          if (radialChart) {
            radialChart.destroy();
          }
          radialChart = null;
        });
      })); 

    // Makes bubbles fade in on first load
    svg.selectAll(".bubble")
      .transition()
      .duration(300) 
      .attr("opacity", 1);
    
    //bubble tip creator
    svg.selectAll(".bubble-tip")
    .data(articleData)
    .join("g")
    .attr("class", "bubble-tip")
    .attr("id", (d)=> "bubble-tip-"+d.bs_id)
    .attr("transform", d => "translate(" + (xScale( d.ja_anteil)+20) + ", " + yScale( d.stimmbeteiligung) + ")"  )
    .style("display", "none")   
    .append("rect")     // this is the background to the tooltip
    .attr("x",-5)
    .attr("y",-20)
    .attr("rx",5)
    .attr("fill","#d6dadc")
    .attr("fill-opacity", 0.95)
    .attr("width",270)
    .attr("height",110)
    .each(function(d) {   //loop for wrapping the title with up to 30 Characters
      var lines = splitText(d.kurztitel, 33); 
      for (var i = 0; i < lines.length; i++) {
        d3.select(this.parentNode)
          .append("text")
          .text(lines[i])
          .style("font-family", "sans-serif")
          .style("font-size", 15)
          .attr("stroke", "none")
          .attr("fill", pubColors[d.vorlagentyp])
          .attr("y", (i * 18));
      }
    });

    function splitText(text, maxCharactersPerLine) {    //function to make text split after max 30 Char
      var words = text.split(" ");
      var lines = [];
      var currentLine = "";
      for (var i = 0; i < words.length; i++) {
        var word = words[i];
        if (currentLine.length + word.length <= maxCharactersPerLine) {
          currentLine += " " + word;
        } else {
          lines.push(currentLine.trim());
          currentLine = word;
        }
      }
      lines.push(currentLine.trim());
      return lines;
    }

    // Adding lines for Stimmbeteiligung and entscheidender Anteil in %
    svg.selectAll(".bubble-tip")
    .append("text")
    .text(d => "Entscheidender Stimmenanteil: " + d.entscheidender_anteil.toFixed(1) + "%")
    .attr("y", 78)
    .style("font-family", "sans-serif")
    .style("font-size", 14)
    .attr("stroke", "none")
    .attr("fill", d => pubColors[d.vorlagentyp]);

    svg.selectAll(".bubble-tip")
    .append("text")
    .text(d => "Stimmbeteiligung: " + (d.stimmbeteiligung*100).toFixed(1) + "%")
    .attr("y", 54)
    .style("font-family", "sans-serif")
    .style("font-size", 14)
    .attr("stroke", "none")
    .attr("fill", d => pubColors[d.vorlagentyp]);


    let xVar = document.getElementById("select-x-var").value;
    


    document.getElementById("select-x-var").addEventListener("change", (e)=>{
      
      // update the x-variable based on the user selection
      xVar = e.target.value   
      
      if(xVar === "thema"){
                
        xScale = d3.scaleBand()
          .domain(articleData.map(d => d.thema))
          .range([0, 500])
          .padding(1) // space them out so the bubble appears in the centre
     

        svg.select("#xAxis")            
        .call(d3.axisBottom(xScale).ticks(articleData.length)) // Set the desired number of ticks based on the data length
        .selectAll("text")
        .style("fill", d => pubColors[d])


        svg.selectAll(".bubble")
        .transition()
        .duration(1000)
        .attr("cx", (d) => xScale(d[xVar]) )
        .attr('cy', (d) => yScale(d[yVar]));

        svg.selectAll('#xAxis text') // rotates titles sideways
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '-.3em')
        .attr('transform', 'rotate(-90)')
      }
      else if (xVar === "jastimmen"){
        // rescale the x-axis
        xScale = d3.scaleLinear()
          .domain([0, 1])    
          .range([0, 500]);

        // redraw the x-axis
        svg.select("#xAxis")            
        .call(d3.axisBottom(xScale)
        .ticks(5)
        .tickFormat(d3.format(".0%"))
        .tickSizeOuter(0)
          )  

        svg.selectAll(".bubble")
        .transition()
        .duration(1000)
        .attr("cx", (d) => xScale(d.ja_anteil) ) 
        .attr('cy', (d) => yScale(d[yVar])); 
      
      }
      
   

      // transition each tooltip
      if (xVar === "jastimmen"){  
        svg.selectAll(".bubble-tip")
        .transition()
        .duration(1000)
        .attr("transform", d => "translate(" + (xScale(d.ja_anteil)+20) + ", " +  yScale(d[yVar]) + ")" )
      } else{
        svg.selectAll(".bubble-tip")
        .transition()
        .duration(1000)
        .attr("transform", d => "translate(" + (xScale(d[xVar])+20) + ", " +  yScale(d[yVar]) + ")" )
        .attr("fill","#d6dadc")
        .attr("fill-opacity", 0.95)
    
        }    
      })
  })
  .catch(error => {
    console.error('Error fetching data:', error);
  });
}
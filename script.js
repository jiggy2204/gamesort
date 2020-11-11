
const urlGames = "https://api.rawg.io/api/games";
const apiKey = "7116511b911644eb964c5cb368954192";

function formatQueryParams(params) {
    const queryItems = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    return queryItems.join('&');
  }

      //Add 90 days from beginning date for upcomingGames function
      Date.prototype.addDays = function(days) {
        let date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
    }

function cardCheck(responseJson){
  
}

function displayTitleSearch(responseJson){
    $("#search-results").empty();

    let cardCheck = checkIfInAnyList(responseJson);

    responseJson.results.map(game => {
        console.log(game.developers);
        $("#search-results").append(`
        <li><div id="${game.slug}" class="card">
            <header class="card-header"><img src="./images/icon_addCard"></header>
            <div class='card-info'>
                <p class='card-name'>${game.name}</p>
                <p class='pub-name'>${game.publishers}</p>
            </div>
        </div></li>
        `)
    })

    if(responseJson.previous !== null){
        $("#search-results").append(`<button class='btn prevBtn' id='prevPage'>PREV</button>`)
        $("#prevPage").click(function(){
            getPrev(responseJson.previous);
        })
    }

    if(responseJson.next !== null){
        $("#search-results").append(`<button class='btn nextBtn' id='nextPage'>NEXT</button>`);
        $("#nextPage").click(function(){
            getNext(responseJson.next);
        })
    }

    $("#results").css("display", "block");
}

function getNext(nextPage){
    fetch(nextPage)
    .then(response => response.json())
    .then(responseJson => displayTitleSearch(responseJson))
}

function getPrev(prevPage){
    fetch(prevPage)
    .then(response => response.json())
    .then(responseJson => displayTitleSearch(responseJson))
}

function getTitle(gametitle){

    const params = {
        key: apiKey,
        search: gametitle,
        page_size: 20
    };

    const queryString = formatQueryParams(params);
    const url = urlGames + "?" + queryString;

    fetch(url)
    .then(response => response.json())
    .then(responseJson => displayTitleSearch(responseJson))
    .catch(err => {
        $('#js-error-message').text(`Something went wrong: ${err.message}`);
      })
}

const displayUpcomingSection = function(){
return (`        <!--UPCOMING GAMES NEXT MONTH-->
<section id="upcoming">
    <h2>Top 10 Upcoming Games</h2>
    <h4>Add these games to your wishlist!</h4>
    <div class="js-upcoming-list" id="upcoming-list">
    </div>
</section>`)
}

const displayUpcoming = function(responseJson){

    responseJson.results.map((e, idx) =>{
        //convert release date to MM/DD/YYYY format
        let inputDate = new Date(e.released);
        let formattedDate = (inputDate.getMonth() + 1) + "/" + inputDate.getDate() + "/" + inputDate.getFullYear();

        $("#upcoming-list").append(`<div class="upcoming-card" id="${e.slug}" style="background:url('${e.background_image}');background-size:cover;background-position:center;"><div class='card-text'><p>${e.name}</p><p>Release Date: ${formattedDate}</p></div></div>`);
    });

    $('.js-upcoming-list').slick({
        dots: true,
        infinite: false,
        speed: 300,
        slidesToShow: 4,
        slidesToScroll: 4,
        responsive: [
          {
            breakpoint: 1024,
            settings: {
              slidesToShow: 3,
              slidesToScroll: 3,
              infinite: true,
              dots: true
            }
          },
          {
            breakpoint: 600,
            settings: {
              slidesToShow: 2,
              slidesToScroll: 2
            }
          },
          {
            breakpoint: 480,
            settings: {
              slidesToShow: 1,
              slidesToScroll: 1
            }
          }
          // You can unslick at a given breakpoint now by adding:
          // settings: "unslick"
          // instead of a settings object
        ]
      });
}


function getUpcoming(){

    let beginDate = new Date;    
    let endDate = new Date().addDays(90);

    let beginDay = beginDate.toJSON().split("T");
    let endDay = endDate.toJSON().split("T");

    let dateRange = beginDay[0] + "," + endDay[0];

    const params = {
        key: apiKey,
        ordering: "-rating",
        dates: dateRange,
        page_size: 10
    };

    const queryString = formatQueryParams(params);
    const url = urlGames + "?" + queryString;

    fetch(url)
    .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error(response.statusText);
      })
      .then(responseJson => displayUpcoming(responseJson))
      .catch(err => {
        $('#js-error-message').text(`Something went wrong: ${err.message}`);
      })
}

const displayMenuBoxes = function(){
    return (`<section id="menu-boxes">
    <!--WISHLIST-->
    <div id="wishlist" class="main-menu-item">
        <p>WISHLIST</p>
        <ul id="js-wishlist-list"></ul>
    </div>

    <!--COLLECTIONS-->
    <div id="collection" class="main-menu-item">
        <p>COLLECTIONS</p>
        <ul id="js-collection-list"></ul>
    </div>
    </section>`);
}


const displaySearch = function(){
    return (`<!--SEARCH BAR-->
    <section id="search-bar">
        <form id="search-games">
            <label for="search">ENTER TITLE:</label><br>
            <input id="search" type="text" name="gametitle">

            <input id="searchBtn" form="search-games" type="submit" class="btn search-btn" value="SEARCH">
        </form>
        <div id="results" class="hidden">
            <h2>Search Results</h2>
            <ul id="search-results"></ul>
        </div>
    </section>`)
}

const displayList = function(type){
  $(".list").append(`
    <h3>${type}</h3>
    <ul></li>
  `);
}

function getList(listButton){

    $(".main-menu-item").removeClass("selected");
    $("#"+listButton).addClass("selected");

    $("#upcoming").remove();
    $(".list").remove();

    displayList(listButton);

    return($("#menu-boxes").after(`<section class="list" id="${listButton}-list">
    </section>`));
}

function render(){

    getUpcoming();
    $("body")
    .append(displayMenuBoxes)
    .append(displayUpcomingSection)
    .append(displaySearch);
    
    $("form#search-games").submit(event =>{
        event.preventDefault();

        let gametitle = $("#search").val();

        getTitle(gametitle);
    });

    $(".main-menu-item").click(function(){
        getList(this.id);
    });
}

$(render);
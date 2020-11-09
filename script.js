
const urlGames = "https://api.rawg.io/api/games";
const apiKey = "7116511b911644eb964c5cb368954192";

function formatQueryParams(params) {
    const queryItems = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    return queryItems.join('&');
  }

function displayUpcoming(responseJson){
console.log(responseJson);
}


function displayTitleSearch(responseJson){
    $("#search-results").empty();

    responseJson.results.map(game => {
        $("#search-results").append(`<li>${game.name}</li>`)
    })

    if(responseJson.previous !== null){
        $("#search-results").append(`<div id='prevPage'>PREV</div>`)
        $("#prevPage").click(function(){
            getPrev(responseJson.previous);
        })
    }

    if(responseJson.next !== null){
        $("#search-results").append(`<div id='nextPage'>NEXT</div>`);
        $("#nextPage").click(function(){
            getNext(responseJson.next);
        })
    }
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
        page_size: 10
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

function getUpcomingGames(){
    let newGames = [];

    let setdate = new Date;
    let month = setdate.setMonth(setdate.getMonth()+1);
    console.log(Date.valueOf());

    console.log(setdate);

    let pullDate = setdate.toJSON().split("T");
    console.log(pullDate[0])

    const params = {
        key: apiKey,
        dates: setdate
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
      .then(responseJson => newGames.push(responseJson))
      .catch(err => {
        $('#js-error-message').text(`Something went wrong: ${err.message}`);
      })

      return newGames;
}

function render(){
    $("form#search-games").submit(event =>{
        event.preventDefault();

        let gametitle = $("#search").val();

        getTitle(gametitle);
    });
}

$(render);
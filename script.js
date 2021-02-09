const urlGames = "https://api.rawg.io/api/games";
const urlStores = "https://api.rawg.io/api/stores";
const apiKey = "7116511b911644eb964c5cb368954192";

// format query paramters for api calls
function formatQueryParams(params) {
  const queryItems = Object.keys(params).map(
    (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
  );

  return queryItems.join("&");
}

//Create addDays function to Date prototype
Date.prototype.addDays = function (days) {
  let date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
};

function getSearchResults(games) {
  const params = {
    key: apiKey,
    page_size: 5,
    search: games,
  };

  const queryString = formatQueryParams(params);

  const url = urlGames + "?" + queryString;

  fetch(url)
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then((responseJson) => {
      displaySearchResults(responseJson);
    })
    .catch((err) => {
      $(`#js-error-message`).text(`Something went wrong: ${err.message}`);
    });
}

function displaySearchResults(responseJson) {
  $("#search-results").empty();
  $("#resultsNav").remove();

  $("#results").removeClass("hidden");

  let cardId = "";

  for (let i = 0; i < responseJson.results.length; i++) {
    cardId = responseJson.results[i].slug;

    let parsing = responseJson.results[i].released.split("-");

    let getReleaseDate = {
      year: parsing[0],
      month: parsing[1],
      day: parsing[2],
    };

    let formattedDate =
      getReleaseDate.month +
      "/" +
      getReleaseDate.day +
      "/" +
      getReleaseDate.year;

    let image = "";

    if (responseJson.results[i].background_image !== null) {
      image = `<img class="card-img" src="${responseJson.results[i].background_image}">`;
    }

    $("#search-results").append(`
            <li>
              <div id="${cardId}" class="card searchCard">
                <div class="bg-darken">
  
                    ${image}
  
                    <div class='card-info'>

                        <div id="card-text">
                          <p class='card-name'>${
                            responseJson.results[i].name
                          }</p>
                          <p class='card-name'>Release Date: ${formattedDate}</p>
                        </div>
                        <div id="card-platforms" class="platforms">
                        <ul id="js-platform-list">
                        ${getPlat(responseJson.results[i].platforms)}
                        </ul>
                      </div>
                      <div id="card-stores" class="stores">
                      <h4>Where To Buy</h4>
                        <ul id="js-store-list">
                        ${getStores(responseJson.results[i].stores)}
                        </ul>
                      </div>
                    </div>                
                </div>
              </div>
            </li>
        `);
  }

  $("#results").append(`<div id="resultsNav"></div>`);

  //PREV BUTTON EVENT LISTENER
  if (responseJson.previous != null) {
    $("#resultsNav").append(`
    <button id='resultPrev' class='btn resultPrevBtn'>PREV</button>`);

    $("#resultPrev").click((event) => {
      event.preventDefault();

      getPage(responseJson.previous);
    });
  }

  //NEXT BUTTON EVENT LISTENER
  if (responseJson.next != null) {
    $("#resultsNav").append(`
    <button id='resultNext' class='btn resultNextBtn'>NEXT</button>`);

    $("#resultNext").click((event) => {
      event.preventDefault();

      getPage(responseJson.next);
    });
  }
}

// Get Platform List

function getPlat(platforms) {
  let listItems = [];
  for (let j = 0; j < platforms.length; j++) {
    listItems.push(`<li>${platforms[j].platform.name}</li>`);
  }
  return listItems.join("");
}

function getStores(stores) {
  let listItem = [];
  for (let i = 0; i < stores.length; i++) {
    listItems.push(`<li>${stores[i].store.name}</li>`);
  }

  return listItem.join("");
}

//Get Next and Previous pages of Search

//NEXT & PREV PAGE
function getPage(nav) {
  fetch(nav)
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then((responseJson) => {
      displaySearchResults(responseJson);
    })
    .catch((err) => {
      $(`#js-error-message`).text(`Something went wrong: ${err.message}`);
    });
}

//SUBMIT SEARCH BASED ON TITLE
//These are the inital renders for mobile and up
function handleSearchForm() {
  $("form").submit((e) => {
    e.preventDefault();

    const game = $("#js-search-term").val();

    getSearchResults(game);
  });
}

function handleUpcomingGames() {
  let releaseDate = new Date().addDays(365 / 2);
  let endDate = releaseDate.toJSON().split("T");

  let currentDate = new Date();
  let beginDate = currentDate.toJSON().split("T");

  let dateRange = beginDate[0] + "," + endDate[0];

  const params = {
    key: apiKey,
    ordering: "-added,rating",
    dates: dateRange,
    page_size: 10,
  };

  const queryString = formatQueryParams(params);
  const url = urlGames + "?" + queryString;

  fetch(url)
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then((responseJson) => {
      return displayUpcomingGames(responseJson);
    })
    .catch((err) => {
      $(`#js-error-message`).text(`Something went wrong: ${err.message}`);
    });
}

function displayUpcomingGames(responseJson) {
  responseJson.results.map((e, idx) => {
    //FORMAT RELEASE DATE
    let parsing = e.released.split("-");

    let getReleaseDate = {
      year: parsing[0],
      month: parsing[1],
      day: parsing[2],
    };

    let formattedDate =
      getReleaseDate.month +
      "/" +
      getReleaseDate.day +
      "/" +
      getReleaseDate.year;

    //RETURN UPCOMING CARDS
    $("#js-upcoming-list").append(`
     <div id='${e.slug}' class='card upcomingCard' style='background:url("${e.background_image}");background-size:cover;background-position:center;'>
        <div class='card-footer'>
          <p>${e.name}</p>
          <p>Release Date: ${formattedDate}</p>
        </div>
     </div>
   `);
  });

  $(".upcoming-list").slick({
    dots: true,
    infinite: false,
    speed: 300,
    slidesToShow: 4,
    slidesToScroll: 4,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
      // You can unslick at a given breakpoint now by adding:
      // settings: "unslick"
      // instead of a settings object
    ],
  });
}

function renderHomepage() {
  $("#app").append(`<header class="homepage-header">
        <h1>Video Game Search Engine</h1>
      </header>
      <section class="list hidden" id="">
        <h3 class="group-title"></h3>
        <ul id="js-return-list"></li>
      </section>
      <!--UPCOMING GAMES TOP 10-->
      <section id="upcoming">
        <h2>Most Anticipated</h2>
        <h4>Add these games to your wishlist!</h4>
        <div id="js-upcoming-list" class="upcoming-list"></div>
      </section>
      <!--SEARCH BAR-->
      <section id="search-bar">
        <form id="search-games">
          <label for="search">ENTER TITLE:</label><br />
          <input id="js-search-term" type="text" name="gametitle" required/>

          <input
            id="searchBtn"
            type="submit"
            class="btn search-btn"
            value="SEARCH"
          />
        </form>
      </section>
      <div id="results" class="hidden">
        <h2>Search Results</h2>
        <ul id="search-results"></ul>
      </div>
      <div id="mainFooter"></div>
      `);
}

function handleRender() {
  renderHomepage();
  handleSearchForm();
  handleUpcomingGames();
}

$(handleRender);

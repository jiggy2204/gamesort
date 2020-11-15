const urlGames = "https://api.rawg.io/api/games";
const urlDevs = "https://api.rawg.io/api/developers";
const urlPubs = "https://api.rawg.io/api/publishers";
const urlPlats = "https://api.rawg.io/api/platforms";
//const urlStores = "https://api.rawg.io/api/stores";
const apiKey = "7116511b911644eb964c5cb368954192";

var wishlist = [];
var collection = [
  {
    id: "",
    bgImage: "",
    releaseDate: "",
    developer: "",
    developerId: "",
    publisher: "",
    publisherId: "",
    platforms: [],
  },
];

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
      console.log(responseJson);
      displaySearchResults(responseJson);
    })
    .catch((err) => {
      $(`#js-error-message`).text(`Something went wrong: ${err.message}`);
    });
}

function displaySearchResults(responseJson) {
  $("#search-results").empty();

  $("#results").removeClass("hidden");
  for (let i = 0; i < responseJson.results.length; i++) {
    for (let j = 0; j < responseJson.results[i].platforms.length; i++) {
      let image = "";

      if (game.background_image !== null) {
        image = `<img class="card-img" src="${responseJson.results[i].background_image}">`;
      }

      $("#search-results").append(`
          <li>
            <div id="${responseJson.results[i].slug}" class="card searchCard">
              <div class="bg-darken">

                  ${image}

                  <div class='card-info'>
                      <p class='card-name'>${responseJson.results[i].name}</p>
                      <div id="card-platforms" class="platforms"><ul id="js-platform-list"></ul></div>
                  </div>

                  <div id="sorting" class="sorting-area">
                      <button class="btn addBtn">ADD TO COLLECTION</button>
                      <button class="btn addBtn">ADD TO WISHLIST</button>
                  
                  </div>
              
              </div>
            </div>
          </li>
      `);

      $("#js-platform-list").append(
        `<li>${responseJson.results[i].platforms[j].name}</li>`
      );

      console.log(responseJson.results[i].platforms[j]);
    }
  }

  //PREV BUTTON EVENT LISTENER
  if (responseJson.previous != null) {
    $("#resultsNav").append(`
    <button id='resultPrev' class='btn resultPrevBtn'>PREV</button>`);

    $("#resultPrev").click((event) => {
      event.preventDefault();

      getPrevPage(responseJson.previous);
    });
  }

  //NEXT BUTTON EVENT LISTENER
  if (responseJson.next != null) {
    $("#resultsNav").append(`
    <button id='resultNext' class='btn resultNextBtn'>NEXT</button>`);

    $("#resultNext").click((event) => {
      event.preventDefault();

      getNextPage(responseJson.next);
    });
  }
}

//Get Next and Previous pages of Search

//PREV PAGE
function getPrevPage(prevPage) {
  fetch(prevPage)
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then((responseJson) => {
      displayGames(responseJson);
    })
    .catch((err) => {
      $(`#js-error-message`).text(`Something went wrong: ${err.message}`);
    });
}

//NEXT PAGE
function getNextPage(nextPage) {
  fetch(nextPage)
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
    })
    .then((responseJson) => {
      displayGames(responseJson);
    })
    .catch((err) => {
      $(`#js-error-message`).text(`Something went wrong: ${err.message}`);
    });
}

function getDevs() {
  const params = {
    key: apiKey,
    page_size: 5,
  };

  const queryString = formatQueryParams(params);

  const url = urlDevs + "?" + queryString;

  fetch(url)
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then((responseJson) => {
      return responseJson;
    })
    .catch((err) => {
      $(`#js-error-message`).text(`Something went wrong: ${err.message}`);
    });
}

function getPubs() {
  const params = {
    key: apiKey,
    page_size: 5,
  };

  const queryString = formatQueryParams(params);

  const url = urlPubs + "?" + queryString;

  fetch(url)
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then((responseJson) => {
      return responseJson;
    })
    .catch((err) => {
      $(`#js-error-message").text("Something went wrong: ${err.message}`);
    });
}

//SUBMIT SEARCH BASED ON TITLE
function handleSearchForm() {
  $("form").submit((event) => {
    event.preventDefault();
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
     <div id='${e.slug}' class='card upcomingCard' style='background:url("${e.background_image}");background-size:cover;'>
        <div class='card-header'>
          <img class="addWish" src='./images/icon_addCard.png' />
          <p>Add To Wishlist</p>
        </div>
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
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 600,
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
        <h1>Video Game Organizer</h1>
      </header>
      <section id="menu-boxes">
        <!--WISHLIST-->
        <div id="wishlist" class="main-menu-item">
          <p>WISHLIST</p>
          <ul id="js-wishlist-list"></ul>
        </div>

        <!--COLLECTIONS-->
        <div id="collection" class="main-menu-item">
          <p>COLLECTION</p>
        </div>
      </section>
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
        <div id="resultsNav"></div>
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

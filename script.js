const urlGames = "https://api.rawg.io/api/games";
const apiKey = "7116511b911644eb964c5cb368954192";

var wishlist = [
  {
    id: "",
    bgImage: "",
    releaseDate: "",
    genres: [],
    platforms: [],
  },
];
var collection = [
  {
    id: "",
    bgImage: "",
    releaseDate: "",
    genres: [],
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
                    </div>
  
                    <div id="sorting" class="sorting-area">
                        <button id="coll-Btn" class="btn addBtn">ADD TO COLLECTION</button>
                        <button id="wish-Btn" class="btn addBtn">ADD TO WISHLIST</button>
                    
                    </div>
                
                </div>
              </div>
            </li>
        `);
  }

  $("button").click((event) => {
    event.stopPropagation();

    let card = $(event.currentTarget).closest("li").children("div").attr("id");

    if ($(event.currentTarget).attr("id") === "coll-Btn") {
      checkIfCollected(card);
    } else if ($(event.currentTarget).attr("id") === "wish-Btn") {
      checkIfWishlisted(card);
    }
  });

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

//Display Collection

function displayCollection() {
  $(".list")
    .removeClass("hidden")
    .addClass("collection-group")
    .setAttr("id", "collection");
}

//Add to wish or regular collection

function checkIfCollected(card) {
  //Iterate over collection array and check against object id
  for (let i = 0; i < collection.length; i++) {
    //Check if card is in collection
    if (collection[i].id === card) {
      return alert("This card already exists in collection");
    }

    if (collection[i].id !== card) {
      alert("adding!");
      addToCollection(card);
    }
  }
}

function checkIfWishlisted(card) {
  //Iterate over collection array and check against object id
  for (let i = 0; i < collection.length; i++) {
    //Check if card is in collection
    if (collection[i].id === card) {
      return alert("This card already exists in collection");
    }

    if (collection[i].id !== card) {
      alert("wished!");
      addToWishlist(card);
    }
  }
}

function addToCollection(card) {
  let newObject = {
    id: "",
    bgImage: "",
    releaseDate: "",
    genres: [],
    platforms: [],
  };

  const params = {
    key: apiKey,
    search: card,
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
      for (let i = 0; i < responseJson.results.length; i++) {
        if (responseJson.results[i].slug === card) {
          newObject.id = card;
          newObject.bgImage = responseJson.results[i].background_image;
          newObject.releaseDate = responseJson.results[i].released;

          let platforms = responseJson.results[i].platforms;
          for (let j = 0; j < platforms.length; j++) {
            newObject.platforms.push(platforms[j].platform.name);
          }

          let genres = responseJson.results[i].genres;
          for (let k = 0; k < genres.length; k++) {
            newObject.genres.push(genres[k].name);
          }
        }
      }
    })
    .catch((err) => {
      $(`#js-error-message").text("Something went wrong: ${err.message}`);
    });
  collection.push(newObject);
  return collection;
}

function addToWishlist(card) {
  let newObject = {
    id: "",
    bgImage: "",
    releaseDate: "",
    genres: [],
    platforms: [],
  };

  const params = {
    key: apiKey,
    search: card,
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
      for (let i = 0; i < responseJson.results.length; i++) {
        if (responseJson.results[i].slug === card) {
          newObject.id = card;
          newObject.bgImage = responseJson.results[i].background_image;
          newObject.releaseDate = responseJson.results[i].released;

          let platforms = responseJson.results[i].platforms;
          for (let j = 0; j < platforms.length; j++) {
            newObject.platforms.push(platforms[j].platform.name);
          }

          let genres = responseJson.results[i].genres;
          for (let k = 0; k < genres.length; k++) {
            newObject.genres.push(genres[k].name);
          }
        }
      }
    })
    .catch((err) => {
      $(`#js-error-message").text("Something went wrong: ${err.message}`);
    });

  wishlist.push(newObject);
  return wishlist;
}

//SUBMIT SEARCH BASED ON TITLE
//These are the inital renders for mobile and up
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

const urlGames = "https://api.rawg.io/api/games";
const urlDevs = "https://api.rawg.io/api/developers";
const urlPubs = "https://api.rawg.io/api/publishers";
const urlPlats = "https://api.rawg.io/api/platforms";
const urlGenres = "https://api.rawg.io/api/genres";
const urlStores = "https://api.rawg.io/api/stores";
const apiKey = "7116511b911644eb964c5cb368954192";

function testApi() {
  const params = {
    key: apiKey,
    page_size: 10,
  };

  const queryString = formatQueryParams(params);
  const url = "?" + queryString;

  //   fetch(urlStores + url)
  //     .then((response) => response.json())
  //     .then((responseJson) => {
  //       responseJson.results.map((e, i) => {
  //         console.log(e.name);
  //       });
  //     });

  //   fetch(urlDevs + url)
  //     .then((response) => response.json())
  //     .then((responseJson) => {
  //       responseJson.results.map((e, i) => {
  //         console.log(e.name);
  //       });
  //     });

  //   fetch(urlPubs + url)
  //     .then((response) => response.json())
  //     .then((responseJson) => {
  //       responseJson.results.map((e, i) => {
  //         console.log(e.name);
  //       });
  //     });

  //   fetch(urlPlats + url)
  //     .then((response) => response.json())
  //     .then((responseJson) => {
  //       responseJson.results.map((e, i) => {
  //         console.log(e.name);
  //       });
  //     });
}

// testApi();

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

function displayTitleSearch(responseJson) {
  $("#search-results").empty();

  console.log(responseJson);

  responseJson.results.map((game, idx) => {
    let inputDate = new Date(game.released);
    let formattedDate =
      inputDate.getMonth() +
      1 +
      "/" +
      inputDate.getDate() +
      "/" +
      inputDate.getFullYear();

    let image = "";

    if (game.background_image !== null) {
      image = `<img class="card-img" src="${game.background_image}">`;
    }

    $("#search-results").append(`
            <li>
                <div id="${game.slug}" class="card">

                <div class="bg-darken">
                    ${image}

                    <div class='card-info'>
                        <p class='card-name'>${game.name}</p>
                        <p class='release-date'>Release Date: ${formattedDate}</p>
                    </div>

                    <div id="sorting" class="sorting-area">
                        <button class="btn addBtn">ADD TO COLLECTION</button>
                        <button class="btn addBtn">ADD TO WISHLIST</button>
                    
                    </div>
                
                </div>

                </div>
            </li>
        `);
  });

  if (responseJson.previous !== null) {
    $("#search-results").append(
      `<button class='btn prevBtn' id='prevPage'>PREV</button>`
    );
    $("#prevPage").click(function () {
      getPrev(responseJson.previous);
    });
  }

  if (responseJson.next !== null) {
    $("#search-results").append(
      `<button class='btn nextBtn' id='nextPage'>NEXT</button>`
    );
    $("#nextPage").click(function () {
      getNext(responseJson.next);
    });
  }

  $("#results").css("display", "block");
}

function getNext(nextPage) {
  fetch(nextPage)
    .then((response) => response.json())
    .then((responseJson) => displayTitleSearch(responseJson));
}

function getPrev(prevPage) {
  fetch(prevPage)
    .then((response) => response.json())
    .then((responseJson) => displayTitleSearch(responseJson));
}

function getTitle(gametitle) {
  const params = {
    key: apiKey,
    search: gametitle,
    page_size: 5,
  };

  const queryString = formatQueryParams(params);
  const url = urlGames + "?" + queryString;

  fetch(url)
    .then((response) => response.json())
    .then((responseJson) => displayTitleSearch(responseJson))
    .catch((err) => {
      $("#js-error-message").text(`Something went wrong: ${err.message}`);
    });
}

function submitSearchByTitle() {
  $("form#search-games").submit((event) => {
    event.preventDefault();

    let gametitle = $("#search").val();

    getTitle(gametitle);
  });
}

function displayUpcoming(responseJson) {
  responseJson.results.map((e, idx) => {
    //convert release date to MM/DD/YYYY format
    let inputDate = new Date(e.released);
    let formattedDate =
      inputDate.getMonth() +
      1 +
      "/" +
      inputDate.getDate() +
      "/" +
      inputDate.getFullYear();

    $("#upcoming-list").append(
      `<div class="upcoming-card" id="${e.slug}" style="background:url('${e.background_image}');background-size:cover;background-position:center;"><div class='card-text'><p>${e.name}</p><p>Release Date: ${formattedDate}</p></div></div>`
    );
  });

  $(".js-upcoming-list").slick({
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

function handleUpcoming() {
  let beginDate = new Date();
  let endDate = new Date().addDays(90);

  let beginDay = beginDate.toJSON().split("T");
  let endDay = endDate.toJSON().split("T");

  let dateRange = beginDay[0] + "," + endDay[0];

  const params = {
    key: apiKey,
    ordering: "-rating",
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
    .then((responseJson) => displayUpcoming(responseJson))
    .catch((err) => {
      $("#js-error-message").text(`Something went wrong: ${err.message}`);
    });
}

function displayList(type) {
  $(".list").append(`
    <h3>${type}</h3>
    <ul></li>
  `);
}

function handleListButton() {
  $(".main-menu-item").click(function (e) {
    e.preventDefault();
    handleList(this.id);
  });
}

function handleList(listButton) {
  $(".main-menu-item").removeClass("selected");
  $("#" + listButton).addClass("selected");

  $("#upcoming").remove();
  $("#search-bar").remove();
  $(".list").remove();

  displayList(listButton);

  return $("#menu-boxes").after(`<section class="list" id="${listButton}-list">
    </section>`);
}

function handleRender() {
  handleUpcoming();
  submitSearchByTitle();
  handleListButton();
}

$(handleRender);

/** Search Shows
 *    - given a search term, search for tv shows that
 *      match that query.
 *
 */
async function searchShows(query) {
  const res = await axios.get(`http://api.tvmaze.com/search/shows?q=${query}`);
  let shows = [];
  for (let i = 0; i < res.data.length; i++) {
    if(res.data[i].show.image) {
      const { id, name, summary, url, image: { original: image }} = res.data[i].show;
      shows.push({id, name, summary, url, image});
    } 
    //adds a default link in case there is no image available
    else {
      const { id, name, summary, url } = res.data[i].show;
      const image = "https://tinyurl.com/tv-missing";
      shows.push({id, name, summary, url, image});
    }
  }
  return shows;
}



/** Populate shows list:
 *     - given list of shows, add shows to DOM
 */

function populateShows(shows) {
  const $showsList = $("#shows-list");
  $showsList.empty();
  for (let show of shows) {
    let $item = $(
      `<div class="col-md-6 col-lg-3 Show mb-5" data-show-id="${show.id}">
         <div class="card" data-show-id="${show.id}">
           <img class="card-img-top" src="${show.image}">
           <div class="card-body">
             <h5 class="card-title">${show.name}</h5>
             <p class="card-text">${show.summary ? show.summary : ""}</p>
             <p class="card-text"><a href="${show.url}" target="_blank">View show on TV Maze</a></p>
           </div>
           <button class="btn btn-info p-2 episode">Find Episodes</button>
         </div>
       </div>
      `);

    $showsList.append($item);
  }
  //adds an eventlistener to the button. Fetches episodes when clicked and populates the episode list
  $('.episode').on("click", async function handleEpisodes (evt) {
    evt.preventDefault();
    let episodes = await getEpisodes($(this).parent().data().showId);
    console.log(episodes);
    populateEpisodes(episodes);
  })
}


/** Given a show ID, return list of episodes:
 *      { id, name, season, number }
 */

async function getEpisodes(id) {
  // gets episodes from tvmaze
  const res = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);
  console.log(res);
  let episodes = [];
  for (let i = 0; i < res.data.length; i++) {
    const { id, name, season, number} = res.data[i];
    episodes.push({id, name, season, number});
  }
  return episodes;
}

// Given an array of episodes, populate the episode list on the page and scroll down to it

function populateEpisodes(episodes) {
  const $episodesList = $("#episodes-list");
  $episodesList.empty();
  for (let episode of episodes) {
    let $item = $(`<li>${episode.name} (season ${episode.season}, episode ${episode.number})</li>`);
    $episodesList.append($item);
  }
  $('#episodes-area').show();

  // Using jQuery's animate() method to add smooth page scroll
  $('html, body').animate({
    scrollTop: $('#episodes-area').offset().top
  }, 800);
}

/** Handle search form submission:
 *    - hide episodes area
 *    - get list of matching shows and show in shows list
 */

$("#search-form").on("submit", async function handleSearch (evt) {
  evt.preventDefault();

  let query = $("#search-query").val();
  if (!query) return;

  $("#episodes-area").hide();

  let shows = await searchShows(query);

  populateShows(shows);
});



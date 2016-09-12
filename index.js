// Your Client ID can be retrieved from your project in the Google
// Developer Console, https://console.developers.google.com
var CLIENT_ID = '910466300469-aga20dkv89l4sf4pa1p511srm34c27fc.apps.googleusercontent.com';

var SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];

/**
 * Check if current user has authorized this application.
 */
function checkAuth() {
  gapi.auth.authorize(
    {
      'client_id': CLIENT_ID,
      'scope': SCOPES.join(' '),
      'immediate': true
    }, handleAuthResult);
}

/**
 * Handle response from authorization server.
 *
 * @param {Object} authResult Authorization result.
 */
function handleAuthResult(authResult) {
  var authorizeDiv = document.getElementById('authorize-div');
  if (authResult && !authResult.error) {
    // Hide auth UI, then load client library.
    authorizeDiv.style.display = 'none';
    loadCalendarApi();
  } else {
    // Show auth UI, allowing the user to initiate authorization by
    // clicking authorize button.
    authorizeDiv.style.display = 'inline';
  }
}

/**
 * Initiate auth flow in response to user clicking authorize button.
 *
 * @param {Event} event Button click event.
 */
function handleAuthClick(event) {
  gapi.auth.authorize(
    {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
    handleAuthResult);
    return false;
}

/**
 * Load Google Calendar client library. List upcoming events
 * once client library is loaded.
 */
function loadCalendarApi() {
  gapi.client.load('calendar', 'v3', listUpcomingEvents);
}

/**
 * Print the summary and start datetime/date of the next ten events in
 * the authorized user's calendar. If no events are found an
 * appropriate message is printed.
 */
function listUpcomingEvents() {
  var now = new Date();
  var month = now.getUTCMonth();
  var day = now.getUTCDate();
  var year = now. getUTCFullYear();
  var early = new Date(year, month, day);
  var late = new Date(year, month, day, 23, 59, 59);

  var earlyTomorrow = new Date(early);
  var lateTomorrow = new Date(late);

  earlyTomorrow.setDate(early.getDate() + 1);
  lateTomorrow.setDate(late.getDate() + 1);

  console.log("Query for", early, late);
  var reqToday = gapi.client.calendar.events.list({
    'calendarId': 'primary',
    'timeMin': early.toISOString(),
    'timeMax': late.toISOString(),
    'showDeleted': false,
    'singleEvents': true,
    'maxResults': 100,
    'orderBy': 'updated'
  });

  console.log("Query for", earlyTomorrow, lateTomorrow);
  var reqTomorrow = gapi.client.calendar.events.list({
    'calendarId': 'primary',
    'timeMin': earlyTomorrow.toISOString(),
    'timeMax': lateTomorrow.toISOString(),
    'showDeleted': false,
    'singleEvents': true,
    'maxResults': 100,
    'orderBy': 'updated'
  });

  reqToday.execute(function(resp) {
    buildList(resp.items, document.querySelector("#today"));
  });

  reqTomorrow.execute(function(resp) {
    buildList(resp.items, document.querySelector("#tomorrow"));
  });
}

function buildList(events, div) {
  if (events.length > 0) {
    for (var e of events) {
      var p = document.createElement("p");
      p.textContent = e.summary;
      div.appendChild(p);
    }
  } else {
    var p = document.createElement("p");
    p.textContent = "Nothing";
    div.appendChild(p);
  }
}

/**
 * Append a pre element to the body containing the given message
 * as its text node.
 *
 * @param {string} message Text to be placed in pre element.
 */
function appendPre(message) {
  var pre = document.getElementById('output');
  var textContent = document.createTextNode(message + '\n');
  pre.appendChild(textContent);
}


/// <reference types="chrome"/>
declare const $;

const FCC_URL = 'https://learn.freecodecamp.org/';

// Use a url from the GitHub directly since the gist URL will change after each update
const DATA_URL = 'https://raw.githubusercontent.com/PengWang0316/CityUFCCExtension/master/CourseData.json';
let moduleData;

// The method can send the click event to the content page
const sendClick = (event: Event) => chrome.tabs.query({ url: FCC_URL }, (tabs) => chrome.tabs.sendMessage(tabs[0].id, { url: $(event.target).attr('data-url') }));

const formatUI = (passedMap: object) => {
  const mainElement = $('main');

  Object.keys(moduleData).forEach((courseKey: string) => {
    const coursePrefix = courseKey.slice(0, 5);
    let innerHTML = `
      <div><h5>${courseKey}</h5></div>
      <div class="accordion" id="${coursePrefix}">
    `;
    Object.keys(moduleData[courseKey]).forEach((moduleKey: string) => {
      const moduleCollapseId = `collapse${moduleKey}`;
      innerHTML += `
      <div class="card">
      <div class="card-header" id="${moduleKey}">
        <h2 class="mb-0">
          <button class="btn btn-link collapsed" type="button" data-toggle="collapse" data-target="#${moduleCollapseId}" aria-expanded="true" aria-controls="${moduleCollapseId}">
            ${moduleKey}
          </button>
        </h2>
      </div>

      <div id="${moduleCollapseId}" class="collapse" aria-labelledby="${moduleKey}" data-parent="#${coursePrefix}">
        <div class="card-body" id="${moduleKey}Child">
      `;

      let childCount = 1;
      Object.keys(moduleData[courseKey][moduleKey]).forEach((sectionKey: string) => {
        const sectionCollapseId = `collapse${moduleKey}${childCount}`;
        innerHTML += `
        <div class="card">
          <div class="card-header">
            <a href="#" data-toggle="collapse" data-target="#${sectionCollapseId}">${sectionKey}</a>
          </div>

          <div class="card-body collapse" data-parent="#${moduleKey}Child" id="${sectionCollapseId}">
          <ul>
        `;
        Object.keys(moduleData[courseKey][moduleKey][sectionKey]).forEach((challengeKey: string) => {
          innerHTML += `
        <li data-url="${moduleData[courseKey][moduleKey][sectionKey][challengeKey]}">
          <img class="checkIcon" src="${passedMap[moduleData[courseKey][moduleKey][sectionKey][challengeKey]] ? './checked.png' : './unchecked.png'}" alt="passed" />${challengeKey}
        </li>`;
        });
        innerHTML += '</ul></div></div>';
      });
      innerHTML += '</div></div></div>';
    });

    innerHTML += '</div>';
    mainElement.html(innerHTML);
    console.log(innerHTML);

    // Add event listeners
    $(mainElement).find('li').toArray().forEach((li) => li.addEventListener('click', sendClick));
  });
};

const updateUI = (passedMap: object) => {
  $('img').get().forEach((img) => {
    if (passedMap[img.parentNode.getAttribute('data-url')]) img.setAttribute('src', './checked.png');
  });
};

const askContent = (isFirstDraw: boolean) => chrome.tabs.query(
  { url: FCC_URL },
  (tabs) => chrome.tabs.sendMessage(tabs[0].id, {}, (({ html }) => {
    // Parse the the return html text to an map that contains passed elements { url: true }
    const passedMap = {};
    $(html).find('.sr-only').get().forEach((element) => {
      if (element.innerText === 'Passed') passedMap[element.parentNode.parentNode.lastChild.getAttribute('href')] = true;
    });
    if (isFirstDraw) formatUI(passedMap);
    else updateUI(passedMap);
  })),
);

document.addEventListener('DOMContentLoaded', () => {
  $.get(DATA_URL, (data: string) => {
    // Gist always return a string with qutations arround it. We have to remove them before parsing.
    moduleData = JSON.parse(data);
    // formatUI();
    askContent(true);
    // Periodically ask the current HTML from the content page that will be used to format the UI in the popup page.
    setInterval(askContent, 10000);
  });

  // Register the listener for the open panel button
  $('#openPanelBtn').click(() => {
    chrome.windows.create({
      url: './build/popup.html',
      type: 'panel',
      width: 580,
      height: 600,
    });
    window.close();
  });
});

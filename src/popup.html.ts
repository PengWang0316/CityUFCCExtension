/// <reference types="chrome"/>
declare const $;

const FCC_URL = 'https://learn.freecodecamp.org/';

// Use a url from the GitHub directly since the gist URL will change after each update
const DATA_URL = 'https://raw.githubusercontent.com/PengWang0316/CityUFCCExtension/master/CourseData.json';
let moduleData: {
  [module: string]: {
    [sction: string]: {
      [title: string]: string;
    };
  };
};

// The method can send the click event to the content page
const sendClick = (event: Event) => chrome.tabs.query({ url: FCC_URL }, (tabs) => chrome.tabs.sendMessage(tabs[0].id, { url: $(event.target).attr('data-url') }));

const formatUI = (passedMap: object) => {
  const mainElement = $('main');

  Object.keys(moduleData).forEach((courseKey: string) => {
    const coursePrefix = courseKey.slice(0, 5);
    let totalChallengeCount = 0;
    let totalCompletedChallengeCount = 0;
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
          <img class="checkIcon" id="check${moduleKey}" src="./checked.png" alt="passed" />
          <span id="completion${moduleKey}" style="font-size:16px"></span>
        </h2>
      </div>

      <div id="${moduleCollapseId}" class="collapse" aria-labelledby="${moduleKey}" data-parent="#${coursePrefix}">
        <div class="card-body" id="${moduleKey}Child">
      `;

      let sectionCount = 0;
      let challengeCount = 0;
      let completedChallengeCount = 0;
      Object.keys(moduleData[courseKey][moduleKey]).forEach((sectionKey: string) => {
        sectionCount++;
        const sectionCollapseId = `collapse${moduleKey}${sectionCount}`;
        innerHTML += `
        <div class="card">
          <div class="card-header">
            <a href="#" data-toggle="collapse" data-target="#${sectionCollapseId}">${sectionKey}</a>
          </div>

          <div class="card-body collapse" data-parent="#${moduleKey}Child" id="${sectionCollapseId}">
          <ul>
        `;
        Object.keys(moduleData[courseKey][moduleKey][sectionKey]).forEach((challengeKey: string) => {
          challengeCount++;
          totalChallengeCount++;

          // Check if any challenge is not completed and count the number of completed challenges
          if (passedMap[moduleData[courseKey][moduleKey][sectionKey][challengeKey]]) {
            completedChallengeCount++;
            totalCompletedChallengeCount++;
          }

          innerHTML += `
        <li data-url="${moduleData[courseKey][moduleKey][sectionKey][challengeKey]}">
          <img class="checkIcon" src="${passedMap[moduleData[courseKey][moduleKey][sectionKey][challengeKey]] ? './checked.png' : './unchecked.png'}" alt="passed" />${challengeKey}
        </li>`;
        });

        innerHTML += '</ul></div></div>';
      });
      // Update the completion status of the module
      const completionPercent = Math.floor((completedChallengeCount * 100) / challengeCount);
      const checkIcon = (completedChallengeCount === challengeCount) ? './checked.png' : './unchecked.png';
      innerHTML = innerHTML.replace(`id="check${moduleKey}" src="./checked.png"`, `id="check${moduleKey}" src="${checkIcon}"`);
      innerHTML = innerHTML.replace(`<span id="completion${moduleKey}" style="font-size:16px"></span>`, `<span id="completion${moduleKey}" style="font-size:16px">${completedChallengeCount}/${challengeCount} - ${completionPercent}%</span>`);

      innerHTML += '</div></div></div>';
    });

    // Update completetion status of the course
    const completionPercent = Math.floor((totalCompletedChallengeCount * 100) / totalChallengeCount);
    innerHTML = innerHTML.replace(`<div><h5>${courseKey}</h5></div>`, `<div><h5>${courseKey} (${totalCompletedChallengeCount}/${totalChallengeCount} - ${completionPercent}%)</h5></div>`);
    innerHTML += '</div>';
    mainElement.html(innerHTML);

    // Add event listeners
    $(mainElement).find('li').toArray().forEach((li: HTMLElement) => li.addEventListener('click', sendClick));
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

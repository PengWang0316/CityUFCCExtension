/// <reference types="chrome"/>
declare const $;
// declare const chrome;

const DATA_URL = 'https://gist.githubusercontent.com/PengWang0316/59445f5eaec9446a94c56a62319436f2/raw/bc707c9cdc6b6cdc052fe5ac66b6808699f4dc35/AmazonApprentiFCC.json';

const sendClick = (event: Event) => chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => chrome.tabs.sendMessage(tabs[0].id, { url: $(event.target).attr('data-url') }));

const formatUI = (courseData: object) => {
  const mainElement = $('main');

  Object.keys(courseData).forEach((courseKey: string) => {
    const coursePrefix = courseKey.slice(0, 5);
    let innerHTML = `
      <div><h3>${courseKey}</h3></div>
      <div class="accordion" id="${coursePrefix}">
    `;
    Object.keys(courseData[courseKey]).forEach((moduleKey: string) => {
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
        <ul class="card-body">
      `;
      Object.keys(courseData[courseKey][moduleKey]).forEach((challengeKey: string) => {
        // innerHTML += `<li onClick="sendClick(${courseData[courseKey][moduleKey][challengeKey]})">${challengeKey}</li>`;
        innerHTML += `<li data-url="${courseData[courseKey][moduleKey][challengeKey]}">${challengeKey}</li>`;
      });
      innerHTML += '</ul></div></div>';
    });

    innerHTML += '</div>';
    mainElement.append(innerHTML);

    // Add event listeners
    $(mainElement).find('li').toArray().forEach((li) => li.addEventListener('click', sendClick));
  });
};

document.addEventListener('DOMContentLoaded', () => {
  $.get(DATA_URL, (data: string) => {
    // Gist always return a string with qutations arround it. We have to remove them before parsing.
    formatUI(JSON.parse(data.slice(1, data.length - 1)));
  });
});

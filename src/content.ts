/// <reference types="chrome"/>
const JAVASCRIPT_SECTION_TITLE = 'Javascript Algorithms And Data Structures Certification (300 hours)';
const MARK_BG_COLOR = 'yellow';
// declare const chrome;

// // Added one element to the existing interface
// interface NewElement extends Element {
//   offsetTop: number;
// }
let lastElement: HTMLElement;

const emphasizeElement = (url: string) => {
  if (lastElement) lastElement.style.backgroundColor = '';
  const element: HTMLElement = document.querySelector(`a[href="${url}"]`);
  lastElement = element;
  element.style.backgroundColor = MARK_BG_COLOR;
  window.scrollTo({ top: element.offsetTop - 100, behavior: 'smooth' });
};

// Click all sub section in the JavaScript section h5 tags
const clickAllSubSection = (element: HTMLElement) => {
  // wait for the ul element is loaded and click all li element under it.
  setTimeout(() => {
    element.querySelectorAll('h5').forEach((item: HTMLElement) => item.click());
  }, 500);
};

// Find the JavaScript section
const getJavaScriptSection = (isFirst = false): HTMLElement => {
  let javascriptSction: HTMLElement;
  document.querySelectorAll('h4').forEach((element: HTMLElement) => {
    if (element.innerText === JAVASCRIPT_SECTION_TITLE) {
      if (isFirst) element.click();
      javascriptSction = element.parentNode.parentNode.lastChild as HTMLElement;
    }
  });
  return javascriptSction;
};

// Add a message listener to response the click event in the popup page or asking content
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.url) emphasizeElement(request.url);
  else sendResponse({ html: getJavaScriptSection().innerHTML });
});

const init = () => clickAllSubSection(getJavaScriptSection(true));

init();

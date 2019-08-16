const JAVASCRIPT_SECTION_TITLE = 'Javascript Algorithms And Data Structures Certification (300 hours)';

// Added one element to the existing interface
interface NewElement extends Element {
  offsetTop: number;
}

const scrollToElement = () => window.scrollTo({ top: (document.querySelector('a[href="/javascript-algorithms-and-data-structures/functional-programming/introduction-to-currying-and-partial-application"]') as NewElement).offsetTop - 100, behavior: 'smooth'});

// Click all sub section in the JavaScript section h5 tags
const clickAllSubSection = (element: HTMLElement) => {
  // wait for the ul element is loaded and click all li element under it.
  setTimeout(() => {
    (element.parentNode.parentNode.lastChild as HTMLElement).querySelectorAll('h5').forEach((item: HTMLElement) => item.click());
    scrollToElement();
  }, 500);
};

const init = () => {
  // Click the JavaScript superblock and all sub sections under it
  document.querySelectorAll('h4').forEach((element: HTMLElement) => {
    if (element.innerText === JAVASCRIPT_SECTION_TITLE) {
      clickAllSubSection(element);
      element.click();
    }
  });
};

init();

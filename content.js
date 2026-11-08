// AI Overview text patterns for different languages
const AI_OVERVIEW_PATTERNS = [
  /übersicht mit ki/i, // de
  /ai overview/i, // en
  /prezentare generală generată de ai/i, // ro
  /AI による概要/, // ja
  /Обзор от ИИ/, // ru
  /AI 摘要/, // zh-TW
  /AI-overzicht/i, // nl
  /AI-oversigt/i, // da
  /Vista creada con IA/i, // es
  /Přehled od AI/i, // cz
  /Aperçu IA/i, // fr
];

// Main DOM selectors
const DOM_SELECTORS = {
  MAIN_BODY: "div#rcnt",
  MAIN_BODY_MOBILE: "div#center_col",
  HEADER_TABS: "div#hdtb-sc > div",
  MAIN_ELEMENT: '[role="main"]',
  TABS_LIST: '[role="list"]',
  // People Also Ask section (data-initq holds the search) and its questions
  PEOPLE_ALSO_ASK: "[data-initq], div.related-question-pair",
  // Every Things to Know section has a title, but only non-AI sections have content
  THINGS_TO_KNOW_TITLE: '[data-attrid^="lab/title/"], [data-attrid^="lab/cluster/title/"]',
  THINGS_TO_KNOW_CONTENT: '[data-attrid^="lab/content/"], [data-attrid^="lab/cluster/content/"]',
};

// CSS values
const CSS_VALUES = {
  HIDDEN: "none",
  HEADER_PADDING: "12px",
  MAIN_MARGIN: "24px",
};

// Tab patterns
const TAB_PATTERNS = {
  AI_MODE: /^AI Mode$/i,
};

// AI Mode is the udm=50 search vertical in every language, so its tab is found
// by link target rather than by label or position
const AI_MODE_SELECTORS = {
  LINK: 'a[href*="udm="]',
  TAB: '[role="listitem"]',
};
const AI_MODE_UDM = "50";

// For each matching heading, check both possible div containers
function getAiContainerParent(startEl) {
  let el = startEl;

  while (el && el.parentElement) {
    const parent = el.parentElement;

    if (parent.id === "rso") {
      //search results container
      return el;
    }

    if (parent.id === "rcnt") {
      //traditional banner container
      return el;
    }

    // Google sometimes wraps the AI overview together with the organic results,
    // so stop below any parent that also holds a result title link
    const holdsOtherResults = [...parent.children].some(
      (child) => child !== el && child.querySelector("a[href] h3"),
    );
    if (holdsOtherResults) return el;

    el = parent;
  }

  return startEl;
}

function getResultBlock(startEl) {
  let el = startEl;

  while (el && el.parentElement) {
    const parent = el.parentElement;

    if (parent.parentElement?.id === "rso") {
      return el;
    }

    el = parent;
  }
}

const getAiOverview = (mainBody) => {
  if (!mainBody) return null;

  const inner =
    mainBody.querySelector('[data-async-type="folsrch"]') ||
    mainBody.querySelector('[id^="folsrch"]');

  if (inner) {
    const block = getAiContainerParent(inner);
    if (block) {
      return block;
    }
  }

  return null;
};

// On some searches the AI Overview title sits in its own box above the results, apart from its body
const getAiOverviewTitleBlocks = (mainBody) => {
  if (!mainBody) return [];

  return [...mainBody.querySelectorAll('[role="heading"]')]
    .filter((heading) =>
      AI_OVERVIEW_PATTERNS.some((pattern) => pattern.test(heading.textContent.trim())),
    )
    .map(getAiContainerParent)
    // Only boxes above the results, never #rso or anything containing it
    .filter((block) => block.parentElement?.id === "rcnt" && !block.querySelector("#rso"));
};

const getThingsToKnow = () => {
  const thingsToKnow = document.querySelectorAll(DOM_SELECTORS.THINGS_TO_KNOW_TITLE);
  for (const el of thingsToKnow) {
    const block = getResultBlock(el);
    if (block) {
      return block;
    }
  }
};

// Each section is the child of the closest element holding every section title
const getThingsToKnowSections = (titles) => {
  let list = titles[0].parentElement;
  while (!titles.every((title) => list.contains(title))) {
    list = list.parentElement;
  }
  return titles.map((title) => [...list.children].find((child) => child.contains(title)));
};

// Hide the AI sections, or the whole block (header included) if every section is AI
const hideThingsToKnow = (block) => {
  const titles = [...block.querySelectorAll(DOM_SELECTORS.THINGS_TO_KNOW_TITLE)];
  const sections = titles.length > 1 ? getThingsToKnowSections(titles) : [block];
  const aiSections = sections.filter(
    (section) => !section.querySelector(DOM_SELECTORS.THINGS_TO_KNOW_CONTENT),
  );

  if (aiSections.length === sections.length) {
    block.style.display = CSS_VALUES.HIDDEN;
    return;
  }

  // Re-run on every mutation, so anything hidden before its content loaded is shown again
  block.style.display = "";
  sections.forEach((section) => {
    section.style.display = aiSections.includes(section) ? CSS_VALUES.HIDDEN : "";
  });
};

const isAiModeLink = (link) => {
  try {
    return new URL(link.href).searchParams.get("udm") === AI_MODE_UDM;
  } catch {
    return false;
  }
};

const getAiModeTabs = () => {
  const tabs = new Set();

  for (const link of document.querySelectorAll(AI_MODE_SELECTORS.LINK)) {
    if (isAiModeLink(link)) tabs.add(link.closest(AI_MODE_SELECTORS.TAB) || link);
  }

  // English label fallback in case the link target changes
  const tabsList = document.querySelector(DOM_SELECTORS.TABS_LIST)?.children;
  for (const tab of tabsList || []) {
    if (TAB_PATTERNS.AI_MODE.test(tab.textContent.trim())) tabs.add(tab);
  }

  return [...tabs];
};

const hideAiOverview = () => {
  const mainBody =
    document.querySelector(DOM_SELECTORS.MAIN_BODY) ||
    document.querySelector(DOM_SELECTORS.MAIN_BODY_MOBILE);

  const blocks = [getAiOverview(mainBody), ...getAiOverviewTitleBlocks(mainBody)].filter(Boolean);
  blocks.forEach((block) => {
    block.style.display = CSS_VALUES.HIDDEN;
  });
  if (!blocks.length) return;

  // Close the gap the hidden overview leaves; only needed when something was hidden
  const headerTabs = document.querySelector(DOM_SELECTORS.HEADER_TABS);
  if (headerTabs) headerTabs.style.paddingBottom = CSS_VALUES.HEADER_PADDING;
  const mainElement = document.querySelector(DOM_SELECTORS.MAIN_ELEMENT);
  if (mainElement) mainElement.style.marginTop = CSS_VALUES.MAIN_MARGIN;
};

// "People also ask" answers are AI Overviews
const hidePeopleAlsoAsk = () => {
  document.querySelectorAll(DOM_SELECTORS.PEOPLE_ALSO_ASK).forEach((el) => {
    (getResultBlock(el) || el).style.display = CSS_VALUES.HIDDEN;
  });
};

const hideThingsToKnowBlock = () => {
  const thingsToKnow = getThingsToKnow();
  if (thingsToKnow) hideThingsToKnow(thingsToKnow);
};

const hideAiModeTabs = () => {
  getAiModeTabs().forEach((tab) => {
    tab.style.display = CSS_VALUES.HIDDEN;
  });
};

const STEPS = [hideAiOverview, hidePeopleAlsoAsk, hideThingsToKnowBlock, hideAiModeTabs];

const run = () => {
  scheduled = false;
  // One failing step must not stop the others when Google changes its markup
  for (const step of STEPS) {
    try {
      step();
    } catch (error) {
      console.debug("AI Overviews Blocker:", step.name, error);
    }
  }
};

// Google mutates the DOM constantly; run at most once per frame
let scheduled = false;
const observer = new MutationObserver(() => {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(run);
});

observer.observe(document, {
  childList: true,
  subtree: true,
});
// Text that is not in content/body.html but is drawn by the scripts in public/assets/js/site.js.
// Each entry has the same default the script used to hold, so the page is identical until it is edited.
// `anchor` is an element id in body.html (or `attribute=value`); the entry is listed right where that element sits,
// so the dashboard keeps the order of the page.
// `lines: true` means one item per line.

export const CODE_DEFAULT =
  'type Company = {\n  name: string\n  founder: string\n  stage: Stage\n  booksCurrentAsOf?: Date\n  peopleToChase?: number\n}\n\nexport async function askVitthaChittha(company: Company) {\n  if (daysBehind(company.booksCurrentAsOf) > 0) {\n    console.warn("The numbers are older than the decision.")\n  }\n\n  if ((company.peopleToChase ?? 0) > 0) {\n    console.warn("That is a lot of follow-ups.")\n  }\n\n  return {\n    booksCurrentAsOf: "today",\n    conversations: 1,\n    followUps: 0,\n  }\n}';

export const COVER_DEFAULT = [
  'Revenue', 'Receivables', 'Payables', 'Payroll', 'Bank accounts', 'Cards and expenses', 'GST', 'TDS',
  'Income tax', 'Company-law filings', 'Cap table', 'ESOPs', 'Fundraising', 'Investor rights',
  'Debt and credit lines', 'Grants and subsidies', 'Contracts', 'Subscriptions', 'Inventory', 'Fixed assets',
  'Related parties', 'Foreign exchange', 'Insurance', 'Board resolutions', 'Budgets', 'Forecasts',
  'Vendor terms', 'Customer terms', 'Refunds and disputes', 'Founder loans',
].join('\n');

export const JS_STRINGS = [
  { key: 'js.cover', anchor: 'cover', label: 'Chips under "What gets mapped" (one per line)', lines: true, default: COVER_DEFAULT },
  { key: 'js.box0.big', anchor: 'boxSvg', label: 'Drawing: box 1, big text', default: '0' },
  { key: 'js.box0.l1', anchor: 'boxSvg', label: 'Drawing: box 1, first line', default: 'follow-ups the' },
  { key: 'js.box0.l2', anchor: 'boxSvg', label: 'Drawing: box 1, second line', default: 'founder makes' },
  { key: 'js.box1.big', anchor: 'boxSvg', label: 'Drawing: box 2, big text', default: '1' },
  { key: 'js.box1.l1', anchor: 'boxSvg', label: 'Drawing: box 2, first line', default: 'conversation,' },
  { key: 'js.box1.l2', anchor: 'boxSvg', label: 'Drawing: box 2, second line', default: 'with us' },
  { key: 'js.box2.big', anchor: 'boxSvg', label: 'Drawing: box 3, big text', default: 'Day 0' },
  { key: 'js.box2.l1', anchor: 'boxSvg', label: 'Drawing: box 3, first line', default: 'in the books' },
  { key: 'js.blog0.a', anchor: 'data-img=0', label: 'Letters picture 1, left cube', default: '0' },
  { key: 'js.blog0.b', anchor: 'data-img=0', label: 'Letters picture 1, right cube', default: '45' },
  { key: 'js.blog1.a', anchor: 'data-img=1', label: 'Letters picture 2, left cube', default: '?' },
  { key: 'js.blog1.b', anchor: 'data-img=1', label: 'Letters picture 2, right cube', default: 'A' },
  { key: 'js.blog2.a', anchor: 'data-img=2', label: 'Letters picture 3, left cube', default: '₹' },
  { key: 'js.blog2.b', anchor: 'data-img=2', label: 'Letters picture 3, right cube', default: '₹' },
  { key: 'js.blog3.a', anchor: 'data-img=3', label: 'Letters picture 4, left cube', default: '1' },
  { key: 'js.blog3.b', anchor: 'data-img=3', label: 'Letters picture 4, middle cube', default: '2' },
  { key: 'js.blog3.c', anchor: 'data-img=3', label: 'Letters picture 4, right cube', default: '3' },
  { key: 'js.blog4.a', anchor: 'data-img=4', label: 'Letters picture 5, cube', default: '10' },
  { key: 'js.code', anchor: 'code', label: 'Code window text (typed out on screen)', multiline: true, default: CODE_DEFAULT },
  { key: 'js.copied', anchor: 'copyMail', label: 'Button text after "Copy our email" is pressed (the email is added after it)', default: 'Copied: ' },
];

const puppeteer = require("puppeteer");
const PUPPETEER_OPTS = {
  headless: true,
  slowMo: { default: 3000, click: 200, keyup: 10 },
  devtools: true,
};

const WEB_TRADUCTOR =
  "https://www.google.com/search?client=ubuntu&channel=fs&q=traducir+de+ingles+a+espa%C3%B1ol+&ie=utf-8&oe=utf-8";
//
const español = "#tw-source-text-ta";
const ingles = "#tw-target-text > span";

async function traducir(text, page) {
  await page.click(español);
  await page.keyboard.down("Control");
  await page.keyboard.press("KeyA");
  await page.keyboard.up("Control");
  //await page.keyboard.type();

  await page.keyboard.type(text);

  await page.waitFor(1000);
  await page.waitForSelector(ingles);
  text = await page.evaluate(() => {
    const anchor = document.querySelector("#tw-target-text > span");
    return anchor.textContent;
  });
  return new Promise((resolve) => resolve(text));
}

(async () => {
  const browser = await puppeteer.launch(PUPPETEER_OPTS);
  const page = await browser.newPage();
  // await page.goto(WEB_TRADUCTOR, { waitUntil: "networkidle2" });
  await page.goto(WEB_TRADUCTOR);

  await page.waitFor(español);

  //await page.$eval(español, (el) => (el.value = "This is a red car"));

  console.log(await traducir("This is a red car !!!", page));
  console.log(await traducir("Spinner ", page));
  console.log(
    await traducir(
      "This example logs the KeyboardEvent.code value whenever you press a key ",
      page
    )
  );

  await browser.close();
})();

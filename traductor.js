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

class Traductor {
  input_table = [];
  output_table = [];

  browser = {};
  page = {};

  constructor(tabla) {
    this.input_table = tabla;
    this.translate = async function (text) {
      await this.page.click(español);
      await this.page.keyboard.down("Control");
      await this.page.keyboard.press("KeyA");
      await this.page.keyboard.up("Control");
      //await this.page.keyboard.type();

      await this.page.keyboard.type(text);

      await this.page.waitFor(1000);
      await this.page.waitForSelector(ingles);
      text = await this.page.evaluate(() => {
        const anchor = document.querySelector("#tw-target-text > span");
        return anchor.textContent;
      });
      return new Promise((resolve) => resolve(text));
    };
  }

  async init(table) {
    this.browser = await puppeteer.launch(PUPPETEER_OPTS);
    this.page = await browser.newPage();
    // await page.goto(WEB_TRADUCTOR, { waitUntil: "networkidle2" });
    await page.goto(WEB_TRADUCTOR);

    await page.waitFor(español);
    if (table) {
      getResults(table);
    }
    return new Promise((resolve, reject) => {
      resolve(getResults());
    });
  }

  getResults(table) {
    return this.output_table;
  }

  async close() {
    await browser.close();
  }
}

exports.Traductor = Traductor;

// (async () => {

//     //await page.$eval(español, (el) => (el.value = "This is a red car"));

//     console.log(await traducir("This is a red car !!!", page));
//     console.log(await traducir("Spinner ", page));
//     console.log(
//       await traducir(
//         "This example logs the KeyboardEvent.code value whenever you press a key ",
//         page
//       )
//     );

//   })();

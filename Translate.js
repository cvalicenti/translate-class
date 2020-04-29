const puppeteer = require("puppeteer");

let config = {
  URL_Traductor:
    "https://www.google.com/search?client=ubuntu&channel=fs&q=traducir+de+ingles+a+espa%C3%B1ol+&ie=utf-8&oe=utf-8",
  puppeter_opt: {
    headless: true,
    slowMo: { default: 3000, click: 200, keyup: 10 },
    devtools: true,
  },
  español_el: "#tw-source-text-ta",
  ingles_el: "#tw-target-text > span",
};

class Translate {
  input_table = [];
  output_table = [];

  browser = {};
  page = {};
  progress = function (actual, total) {};

  constructor(table, headless = false, progress = null) {
    if (progress) {
      this.progress = progress;
    }
    config.puppeter_opt.headless = headless;
    this.input_table = table;
    this.translate = async function (text) {
      await this.page.click(config.español_el);
      await this.page.keyboard.down("Control");
      await this.page.keyboard.press("KeyA");
      await this.page.keyboard.up("Control");
      //await this.page.keyboard.type();

      await this.page.keyboard.type(text);

      await this.page.waitFor(1000);
      await this.page.waitForSelector(config.ingles_el);
      text = await this.page.evaluate(() => {
        const anchor = document.querySelector("#tw-target-text > span");
        return anchor.textContent;
      });
      return new Promise((resolve) => resolve(text));
    };
  }

  async exec(table = null) {
    if (table) {
      this.input_table.push(...table);
    }
    let count = 0;
    this.progress(this.input_table.length, 0);

    this.browser = await puppeteer.launch(config.puppeter_opt);
    this.page = await this.browser.newPage();

    await this.page.goto(config.URL_Traductor);

    await this.page.waitFor(config.español_el);

    let tranlated;
    for (const text of this.input_table) {
      tranlated = await this.translate(text);
      this.output_table.push(tranlated);
      count++;
      this.progress(this.input_table.length, count);
    }
    this.input_table = [];

    return new Promise((resolve, reject) => {
      resolve(this.output_table);
    });
  }

  async close() {
    await this.browser.close();
  }
}

module.exports = Translate;

const puppeteer = require("puppeteer");
const fetch = require("node-fetch");
const { exec } = require("child_process");

// Opciones para la ejecución de Puppeteer
const PUPPETEER_OPTS = {
  headless: false,
  slowMo: { default: 3000, click: 200, keyup: 10 },
  devtools: false,
};

// Rutas involucradas en el proceso de despliegue
//const WEB_TRADUCTOR = "https://translate.google.com.ar/?hl=es";
const WEB_TRADUCTOR =
  "https://www.google.com/search?client=ubuntu&channel=fs&q=traducir+de+ingles+a+espa%C3%B1ol+&ie=utf-8&oe=utf-8";
//
const español = "#tw-source-text-ta";
const ingles = "#tw-target-text-ta > span";

// Funciones de navegación
const click = (element) => element.click();
const waitForSelector = (page, selector) => async () =>
  await page.waitForSelector(selector);
const waitToDissapear = (page, selector) => async () =>
  await page.waitForSelector(selector, { hidden: true });

// Funcion principal que contiene el flujo de compilacion y despliegue de la aplicación
const run = async () => {
  try {
    // Inicializamos Chromium
    const browser = await puppeteer.launch(PUPPETEER_OPTS);
    const page = await browser.newPage();

    await page.goto(WEB_TRADUCTOR);

    await page.click(español);
    await page.keyboard.type("This is a test !!!");

    await page.waitForSelector(español);
    await page.waitFor(3000);
    console.log("sigue");
    const texto = await page.$(español);

    console.log(texto);
  } catch (error) {
    console.log(error);
  }
};

//runAutoDeploy()

run();

const TIMEOUT = 5000;
const DEFAULT_ATTEMPTS = 3;

function delay(millis) {
  return new Promise((resolve) => setTimeout(resolve, millis));
}

async function retry(fn, retries = DEFAULT_ATTEMPS) {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    return await delay(TIMEOUT).then(() => retry(fn, retries - 1));
  }
}

// Y así la llamariamos
// await retry(async () => page.$(SOME_BTN).then(element => element.click()));

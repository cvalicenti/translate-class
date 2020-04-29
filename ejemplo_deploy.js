const puppeteer = require("puppeteer");
const fetch = require("node-fetch");
const { exec } = require("child_process");

// Opciones para la ejecución de Puppeteer
const PUPPETEER_OPTS = {
  headless: false,
  slowMo: { default: 300, click: 200, keyup: 10 },
  devtools: false
};

// Credenciales del Tomcat
const TOMCAT_USER = "tomcat";
const TOMCAT_PASSWORD = "S3cr3t";

// Rutas involucradas en el proceso de despliegue
const TOMCAT_SERVER = "http://localhost:8080/";
const TEST_URL = `${TOMCAT_SERVER}/demo-puppeteer/version`;
const PROJECT_PATH =
  "/Users/cesar.gonzalez/Desktop/Confidential/lab/puppeteer/demo-puppeteer";
const WAR_PATH = `${PROJECT_PATH}/target/demo-puppeteer.war`;

// Elementos usados para el despliegue de aplicaciones en Tomcat
const MANAGER_APP = ' a[href="/manager/html"]';
const APPLICATION_LINK = 'a[href="/demo-puppeteer/"]';
const INPUT_FILE = 'form[action*="upload"] input[name="deployWar"]';
const DEPLOY_BTN = 'form[action*="upload"] input[value="Deploy"]';
const STOP_BTN = 'form[action*="puppeteer"] input[value="Stop"]';
const UNDEPLOY_BTN = 'form[action*="puppeteer"] input[value="Undeploy"]';

// Funciones de navegación
const click = element => element.click();
const waitForSelector = (page, selector) => async () =>
  await page.waitForSelector(selector);
const waitToDissapear = (page, selector) => async () =>
  await page.waitForSelector(selector, { hidden: true });

// Funcion de compilación de proyecto
const generateWarFile = () =>
  new Promise((resolve, reject) => {
    exec(
      "mvn clean package",
      {
        maxBuffer: 1024 * 1000, // Avoid Error: stdout maxBuffer exceeded
        cwd: PROJECT_PATH
      },
      (err, stdout, stderr) => {
        if (err) reject(err);
        if (stdout) console.log(`stdout: ${stdout.slice(-332)}`);
        if (stderr) console.log(`stderr: ${stderr}`);
        resolve();
      }
    );
  });

// Funcion principal que contiene el flujo de compilacion y despliegue de la aplicación
const runAutoDeploy = async () => {
  try {
    // Inicializamos Chromium
    const browser = await puppeteer.launch(PUPPETEER_OPTS);
    const page = await browser.newPage();

    // Compilamos el proyecto
    await generateWarFile();

    // Navegamos a la consola web de Tomcat
    await page.authenticate({
      username: TOMCAT_USER,
      password: TOMCAT_PASSWORD
    });
    await page.goto(TOMCAT_SERVER);

    // Abrimos la sección de gestión de aplicaciones
    await page.click(MANAGER_APP);
    await page.waitFor(1000);

    // Revisamos si la aplicación ya esta desplegada
    const link = await page.$(APPLICATION_LINK);
    if (link) {
      // Esta desplegada, vamos a intentar:

      //  1. Parar la aplicación
      await page
        .$(STOP_BTN)
        .then(click)
        .then(waitToDissapear(page, STOP_BTN))
        .catch(() => console.log("Warn: Unable to stop the app"));

      await page.waitFor(1000);

      //  2. Eliminarla de la lista de aplicaciones
      await page
        .$(UNDEPLOY_BTN)
        .then(click)
        .then(waitToDissapear(page, UNDEPLOY_BTN))
        .catch(() => console.log("Warn: Unable to undeploy the app"));
    }

    // Con el entorno limpio, desplegamos la aplicacion
    await waitForSelector(page, INPUT_FILE)()
      .then(element => element.uploadFile(WAR_PATH))
      .then(waitForSelector(page, DEPLOY_BTN))
      .then(click)
      .then(waitForSelector(page, APPLICATION_LINK));

    // Comprobamos que se haya desplegado correctamente
    await fetch(TEST_URL, {})
      .then(response => response.json())
      .then(async ({ version }) => {
        // La aplicacion se desplego correctamente
        console.log(`App deployed with version ${version}`);
        // Cerramos el navegador
        await browser.close();
      });
  } catch (error) {
    console.log(error);
  }
};

//runAutoDeploy()

const TIMEOUT = 5000;
const DEFAULT_ATTEMPTS = 3;

function delay(millis) {
  return new Promise(resolve => setTimeout(resolve, millis));
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
await retry(async () => page.$(SOME_BTN).then(element => element.click()));

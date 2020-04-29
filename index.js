var Translate = require("./Translate");

function progress(total, actual) {
  console.log("Process... ", actual, " of ", total);
}

async function run() {
  console.log("starting...");
  let array_to_translate = [
    "This is love \n Keep in mind that the resulting array will always be the same length as the original array. \n We can even be more concise with arrow functions (requires ES6 support, Babel or TypeScript)",
    "Yellow submarine",
    "This is the more big test",
    "We can even be more concise with arrow functions (requires ES6 support, Babel or TypeScript)",
    "Keep in mind that the resulting array will always be the same length as the original array.",
  ];

  const translate = new Translate(array_to_translate, true, progress);
  let output_array = Array();
  output_array = await translate.exec(array_to_translate);

  array_to_translate = [
    "This caused collector anger, but did not lower the coin's value, which has continued to increase in the 80-plus years since it was struck.",
    "Jupiter is primarily composed of hydrogen with a quarter of its mass being helium, though helium comprises only about a tenth of the number of molecules. It may also have a rocky core of heavier elements,[20] but like the other giant planets, Jupiter lacks a well-defined solid surface. Because of its rapid rotation, the planet's shape is that of an oblate spheroid (it has a slight but noticeable bulge around the equator). The outer atmosphere is visibly segregated into several bands at different latitudes, resulting in turbulence and storms along their interacting boundaries. A prominent result is the Great Red Spot, a giant storm that is known to have existed since at least the 17th century when it was first seen by telescope. Surrounding Jupiter is a faint planetary ring system and a powerful magnetosphere. Jupiter has 79 known moons,[21] including the four large Galilean moons discovered by Galileo Galilei in 1610. Ganymede, the largest of these, has a diameter greater than that of the planet Mercury.",
  ];

  output_array.push(...(await translate.exec(array_to_translate)));

  await translate.close();

  console.debug("---------------------------------------------------");
  console.debug("translated:");

  let ind = 1;
  output_array.forEach((elem) => {
    console.log(ind++, "--> ", elem);
  });

  console.log("end");
}

run();

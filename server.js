// Primero usamos instalamos la libreria "npm install puppeteer"

const puppeteer = require("puppeteer");

function formatoRut(rut) {
  rut = rut.toString().replace(/\./g, "");
  let rutsdv, dv;
  if (rut.includes("-")) {
    [rutsdv, dv] = rut.split("-");
  } else {
    rutsdv = rut.substring(0, rut.length - 1);
    dv = rut.substring(rut.length - 1);
  }
  const newRut = rutsdv.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${newRut}-${dv}`;
}

(async () => {
  const rut = "21226711-2";
  const rutFormateado = formatoRut(rut);
  const url = `https://www.nombrerutyfirma.com/rut?term=${rutFormateado}`;

  // Lanzamos un navegador real
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  // Seteamos un User Agent real
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  );

  try {
    console.log(`Consultando: ${url}`);

    // Navegamos a la URL y esperamos a que la red esté tranquila (networkidle2)
    await page.goto(url, { waitUntil: "networkidle2" });

    // Extraemos los datos directamente en el contexto del navegador
    const data = await page.evaluate(() => {
      const filas = document.querySelectorAll("table tbody tr");
      const resultados = [];

      filas.forEach((fila) => {
        const columnas = fila.querySelectorAll("td");
        if (columnas.length > 0) {
          resultados.push({
            nombre: columnas[0]?.innerText.trim(),
            rut: columnas[1]?.innerText.trim(),
            genero: columnas[2]?.innerText.trim(),
            direccion: columnas[3]?.innerText.trim(),
            ciudad: columnas[4]?.innerText.trim(),
          });
        }
      });
      return resultados;
    });

    if (data.length === 0) {
      console.log("No se encontraron datos.");
    } else {
      data.forEach((d, index) => {
        console.log(`\n-------------------------------------------`);
        console.log(`Nombre    : ${d.nombre}`);
        console.log(`RUT       : ${d.rut}`);
        console.log(`Género    : ${d.genero}`);
        console.log(`Dirección : ${d.direccion}`);
        console.log(`Ciudad    : ${d.ciudad}`);
        console.log(`\n-------------------------------------------`);
      });
    }
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await browser.close();
  }
})();

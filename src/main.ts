import { downloadPalettePng, downloadPNG, downloadSVG, process } from "./gui";
import { Clipboard } from "./lib/clipboard";

$(document).ready(function () {
  // $(".tabs").tabs();
  $(".tooltipped").tooltip();

  const clip = new Clipboard("canvas", true);

  $("#file").change(function (ev) {
    const files = (<HTMLInputElement>$("#file").get(0)).files;
    if (files !== null && files.length > 0) {
      const reader = new FileReader();
      reader.onloadend = function () {
        const img = document.createElement("img");
        img.onload = () => {
          const c = document.getElementById("canvas") as HTMLCanvasElement;
          const ctx = c.getContext("2d")!;
          c.width = img.naturalWidth;
          c.height = img.naturalHeight;
          ctx.drawImage(img, 0, 0);
        };
        img.onerror = () => {
          alert("Unable to load image");
        };
        img.src = <string>reader.result;
      };
      reader.readAsDataURL(files[0]);
    }
  });

  $("#btnProcess").click(async function () {
    try {
      await process();
    } catch (err) {
      alert("Error: " + err);
    }
  });

  $("#btnDownloadSVG").click(function () {
    downloadSVG();
  });

  $("#btnDownloadPNG").click(function () {
    downloadPNG();
  });

  $("#btnDownloadPalettePNG").click(function () {
    downloadPalettePng();
  });
});

import { downloadSVG, process, updateOutput } from "./gui";
import { GUIProcessManager } from "./guiprocessmanager";
import { Clipboard } from "./lib/clipboard";
import { Settings } from "./settings";

const getDateDifference = (baseDate: string, currentDate: string) => {
  const start = new Date(baseDate);
  const end = new Date(currentDate);

  const timeDifference = end.getTime() - start.getTime();

  const dayDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

  return dayDifference;
};

const validProcessCounts = () => {
  let countsProcess = 0;
  const currentDate = new Date();
  const limit = new Settings().limitCounts;

  const keyCounts = "paint-generator-nums";
  const keyDates = "paint-generator-dates";

  const cacheCounts = localStorage.getItem(keyCounts);
  const cacheDates = localStorage.getItem(keyDates);

  if (cacheCounts != null) countsProcess = Number(cacheCounts);

  if (
    cacheDates != null &&
    getDateDifference(cacheDates.toString(), currentDate.toDateString()) > 1
  ) {
    countsProcess = 0;
    localStorage.setItem(keyDates, currentDate.toDateString());
  }

  countsProcess++;

  if (countsProcess > limit) {
    localStorage.setItem(keyDates, currentDate.toDateString());
    return false;
  }

  localStorage.setItem(keyCounts, countsProcess.toString());
  return true;
};

$(document).ready(function () {
  $("#input-pane").on("click", function (e) {
    $("#input-file").trigger("click");
  });

  $(".tooltipped").tooltip();

  const clip = new Clipboard("input-image", true);

  $("#input-file").on("change", function (ev) {
    const cKmeans = document.getElementById(
      "svgContainer"
    ) as HTMLCanvasElement;
    const ctxKmeans = cKmeans.getContext("2d")!;
    ctxKmeans.fillStyle = "white";
    ctxKmeans.fillRect(0, 0, 2400, 2400);
    $("#svgContainer").css("display", "block");
    $("#svgContainer").siblings("svg").remove();
    $("#palette").empty();

    $("#input-image").siblings("span").css("display", "none");
    const files = (<HTMLInputElement>$("#input-file").get(0)).files;
    if (files !== null && files.length > 0) {
      const reader = new FileReader();
      reader.onloadend = function () {
        const img = document.createElement("img");
        img.onload = () => {
          const c = document.getElementById("input-image") as HTMLCanvasElement;
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
    if (!validProcessCounts()) {
      alert("limit exceeded process counts");
      return;
    }
    if (
      GUIProcessManager.isCanvasBlank(
        document.getElementById("input-image") as HTMLCanvasElement
      )
    )
      return;
    try {
      $(".overlay").css("display", "block");
      await process();
      $(".overlay").css("display", "none");
    } catch (err) {
      alert("Error: " + err);
    }
  });

  $("#chkFillFacets").change(async () => {
    await updateOutput();
  });

  $("#btnDownloadSVG").click(function () {
    downloadSVG();
  });
});

function pad(value) {
  return String(value).padStart(2, "0");
}

function nextAnimationFrame() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Unable to create PNG blob."));
          return;
        }
        resolve(blob);
      },
      "image/png",
      1
    );
  });
}

function applyChartStyleOverrides(chart, overrides = {}) {
  const restoreHandlers = [];
  const options = chart.options ?? {};

  function setValue(target, key, value) {
    if (!target || value === undefined) {
      return;
    }
    const hadProperty = Object.prototype.hasOwnProperty.call(target, key);
    const previousValue = target[key];

    restoreHandlers.push(() => {
      if (hadProperty) {
        target[key] = previousValue;
      } else {
        delete target[key];
      }
    });

    target[key] = value;
  }

  const plugins = options.plugins ?? {};
  const legend = plugins.legend ?? {};
  const legendLabels = legend.labels ?? {};
  const title = plugins.title ?? {};
  const tooltip = plugins.tooltip ?? {};
  const valueOverlay = plugins.valueOverlay ?? {};
  const scales = options.scales ?? {};
  const xScale = scales.x ?? {};
  const xTicks = xScale.ticks ?? {};
  const xTitle = xScale.title ?? {};
  const yScale = scales.y ?? {};
  const yTicks = yScale.ticks ?? {};
  const yTitle = yScale.title ?? {};
  const yGrid = yScale.grid ?? {};

  setValue(title, "color", overrides.titleColor);
  setValue(legendLabels, "color", overrides.axisTextColor);
  setValue(xTicks, "color", overrides.axisTextColor);
  setValue(yTicks, "color", overrides.axisTextColor);
  setValue(xTitle, "color", overrides.axisTextColor);
  setValue(yTitle, "color", overrides.axisTextColor);
  setValue(yGrid, "color", overrides.gridColor);
  setValue(valueOverlay, "color", overrides.valueOverlayColor);
  setValue(tooltip, "backgroundColor", overrides.tooltipBackgroundColor);

  return () => {
    for (let index = restoreHandlers.length - 1; index >= 0; index -= 1) {
      restoreHandlers[index]();
    }
  };
}

export function buildExportFileName(date = new Date()) {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());

  return `chart-${year}${month}${day}-${hour}${minute}.png`;
}

export async function downloadChartAsPng(chart, options = {}) {
  if (!chart?.canvas) {
    throw new Error("Chart is not ready yet.");
  }

  const {
    background = "transparent",
    pixelRatio = 2,
    fileName = buildExportFileName(),
    chartStyleOverrides = {}
  } = options;

  const sourceCanvas = chart.canvas;
  const cssWidth = sourceCanvas.clientWidth || chart.width || sourceCanvas.width;
  const cssHeight = sourceCanvas.clientHeight || chart.height || sourceCanvas.height;

  const previousDevicePixelRatio = chart.options.devicePixelRatio;
  const restoreChartStyles = applyChartStyleOverrides(chart, chartStyleOverrides);

  try {
    chart.options.devicePixelRatio = pixelRatio;
    chart.resize(cssWidth, cssHeight);
    chart.update("none");

    // Wait for the high-DPI render to settle before capturing.
    await nextAnimationFrame();

    const renderedCanvas = chart.canvas;
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = renderedCanvas.width;
    exportCanvas.height = renderedCanvas.height;

    const context = exportCanvas.getContext("2d");
    if (!context) {
      throw new Error("Unable to prepare image export.");
    }

    if (background === "white") {
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    }

    context.drawImage(renderedCanvas, 0, 0);
    const blob = await canvasToBlob(exportCanvas);
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(objectUrl);
  } finally {
    restoreChartStyles();
    chart.options.devicePixelRatio = previousDevicePixelRatio;
    chart.resize(cssWidth, cssHeight);
    chart.update("none");
  }
}

export const valueOverlayPlugin = {
  id: "valueOverlay",
  afterDatasetsDraw(chart, _args, pluginOptions) {
    if (!pluginOptions?.enabled) {
      return;
    }

    const dataset = chart.data.datasets?.[0];
    const dataElements = chart.getDatasetMeta(0)?.data;

    if (!dataset || !dataElements || dataElements.length === 0) {
      return;
    }

    const isPie = chart.config.type === "pie";
    const valueMode = pluginOptions.valueMode === "percentage" ? "percentage" : "exact";
    const sum = dataset.data.reduce((total, value) => {
      const numeric = Number(value);
      return Number.isFinite(numeric) ? total + numeric : total;
    }, 0);

    const { ctx } = chart;
    ctx.save();
    ctx.fillStyle = pluginOptions.color ?? "#2e2543";
    ctx.font =
      pluginOptions.font ??
      '600 12px "Inter", "Segoe UI", system-ui, -apple-system, "Noto Serif Bengali", "Nirmala UI", sans-serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    function formatValue(rawValue) {
      if (!Number.isFinite(rawValue)) {
        return "";
      }
      if (Number.isInteger(rawValue)) {
        return String(rawValue);
      }
      return rawValue.toFixed(1).replace(/\.0$/, "");
    }

    function localizeDigits(text) {
      return String(text).replace(/\d/g, (digit) => {
        const codepoint = digit.charCodeAt(0) + 0x09e6 - 0x0030;
        return String.fromCharCode(codepoint);
      });
    }

    function localizeDigitsByIndex(text, index) {
      const useBengaliForPoint = Array.isArray(pluginOptions.useBengaliNumeralsByIndex)
        ? Boolean(pluginOptions.useBengaliNumeralsByIndex[index])
        : false;

      if (!useBengaliForPoint) {
        return text;
      }

      return localizeDigits(text);
    }

    dataElements.forEach((element, index) => {
      const rawValue = Number(dataset.data[index]);
      if (!Number.isFinite(rawValue)) {
        return;
      }

      let text = formatValue(rawValue);
      let { x, y } = element.tooltipPosition();

      if (isPie) {
        if (valueMode === "percentage") {
          text = `${formatValue(rawValue)}%`;
        } else {
          if (sum <= 0) {
            return;
          }
          const percentage = Math.round((rawValue / sum) * 100);
          text = `${percentage}%`;
        }
      } else {
        if (valueMode === "percentage") {
          text = `${formatValue(rawValue)}%`;
        }
        y = rawValue >= 0 ? y - 12 : y + 12;
        ctx.textBaseline = rawValue >= 0 ? "bottom" : "top";
      }

      if (text.length === 0) {
        return;
      }

      ctx.fillText(localizeDigitsByIndex(text, index), x, y);
      ctx.textBaseline = "middle";
    });

    ctx.restore();
  }
};

function clampPrecision(value) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) {
    return 0;
  }
  return Math.min(2, Math.max(0, parsed));
}

function formatNumber(value, precision) {
  if (!Number.isFinite(value)) {
    return "";
  }
  if (precision === 0) {
    return String(Math.round(value));
  }
  return String(Number(value.toFixed(precision)));
}

function localizeDigits(text) {
  return String(text).replace(/\d/g, (digit) => {
    const codepoint = digit.charCodeAt(0) + 0x09e6 - 0x0030;
    return String.fromCharCode(codepoint);
  });
}

function localizeDigitsByIndex(text, index, useBengaliNumeralsByIndex) {
  const shouldLocalize = Array.isArray(useBengaliNumeralsByIndex)
    ? Boolean(useBengaliNumeralsByIndex[index])
    : false;

  if (!shouldLocalize) {
    return text;
  }

  return localizeDigits(text);
}

function resolveDisplayMode(displayMode, valueMode, isCircularChart) {
  if (displayMode === "value" || displayMode === "percentage" || displayMode === "both") {
    return displayMode;
  }

  if (valueMode === "percentage") {
    return "percentage";
  }

  return isCircularChart ? "percentage" : "value";
}

function resolveLabelText(rawValue, sum, displayMode, valueMode, precision) {
  const valueText = formatNumber(rawValue, precision);
  const valueWithUnit = valueMode === "percentage" ? `${valueText}%` : valueText;
  const shareText = Number.isFinite(sum) && Math.abs(sum) > 0
    ? `${formatNumber((rawValue / sum) * 100, precision)}%`
    : "";

  if (displayMode === "value") {
    return valueWithUnit;
  }

  if (displayMode === "percentage") {
    if (valueMode === "percentage") {
      return valueWithUnit;
    }
    return shareText || valueWithUnit;
  }

  if (displayMode === "both") {
    if (!shareText || valueWithUnit === shareText) {
      return valueWithUnit;
    }
    return `${valueWithUnit} (${shareText})`;
  }

  return valueWithUnit;
}

function resolveLabelGeometry({ chartType, position, element, rawValue }) {
  let { x, y } = element.tooltipPosition();
  let textAlign = "center";
  let textBaseline = "middle";

  if (chartType === "line") {
    if (position === "inside") {
      y += 10;
      textBaseline = "top";
    } else {
      y -= 10;
      textBaseline = "bottom";
    }
    return { x, y, textAlign, textBaseline };
  }

  if (chartType === "bar" || chartType === "horizontalBar") {
    const isHorizontal = chartType === "horizontalBar";
    const base = Number(element.base);

    if (isHorizontal) {
      if (position === "inside") {
        x = Number.isFinite(base) ? (base + x) / 2 : x;
      } else {
        x = rawValue >= 0 ? x + 10 : x - 10;
        textAlign = rawValue >= 0 ? "left" : "right";
      }
    } else {
      if (position === "inside") {
        y = Number.isFinite(base) ? (base + y) / 2 : y;
      } else {
        y = rawValue >= 0 ? y - 10 : y + 10;
        textBaseline = rawValue >= 0 ? "bottom" : "top";
      }
    }

    return { x, y, textAlign, textBaseline };
  }

  if ((chartType === "pie" || chartType === "doughnut") && position === "outside") {
    const arcProps = element.getProps
      ? element.getProps(["x", "y", "startAngle", "endAngle", "outerRadius"], true)
      : element;
    const centerX = Number(arcProps.x);
    const centerY = Number(arcProps.y);
    const midAngle = (Number(arcProps.startAngle) + Number(arcProps.endAngle)) / 2;
    const radius = Number(arcProps.outerRadius) + 14;

    if (Number.isFinite(centerX) && Number.isFinite(centerY) && Number.isFinite(midAngle)) {
      x = centerX + Math.cos(midAngle) * radius;
      y = centerY + Math.sin(midAngle) * radius;
    }
  }

  return { x, y, textAlign, textBaseline };
}

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

    const chartType =
      pluginOptions.chartType === "doughnut" ||
      pluginOptions.chartType === "line" ||
      pluginOptions.chartType === "horizontalBar" ||
      pluginOptions.chartType === "bar"
        ? pluginOptions.chartType
        : "pie";
    const valueMode = pluginOptions.valueMode === "percentage" ? "percentage" : "exact";
    const precision = clampPrecision(pluginOptions.precision);
    const requestedPosition = pluginOptions.position === "inside" || pluginOptions.position === "outside"
      ? pluginOptions.position
      : "auto";
    const normalizedPosition = requestedPosition === "auto"
      ? chartType === "line"
        ? "outside"
        : chartType === "bar" || chartType === "horizontalBar"
          ? "outside"
          : "inside"
      : requestedPosition;
    const isCircularChart = chartType === "pie" || chartType === "doughnut";
    const displayMode = resolveDisplayMode(pluginOptions.displayMode, valueMode, isCircularChart);
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

    dataElements.forEach((element, index) => {
      const rawValue = Number(dataset.data[index]);
      if (!Number.isFinite(rawValue)) {
        return;
      }

      const text = resolveLabelText(rawValue, sum, displayMode, valueMode, precision);
      if (!text) {
        return;
      }

      const geometry = resolveLabelGeometry({
        chartType,
        position: normalizedPosition,
        element,
        rawValue
      });
      ctx.textAlign = geometry.textAlign;
      ctx.textBaseline = geometry.textBaseline;
      ctx.fillText(
        localizeDigitsByIndex(text, index, pluginOptions.useBengaliNumeralsByIndex),
        geometry.x,
        geometry.y
      );
    });

    ctx.restore();
  }
};

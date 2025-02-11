import wait from "../utils/wait.js";

const chartData = {
  pie: {
    type: "pie",
    data: [
      { name: "Mobile", value: 40 },
      { name: "Desktop", value: 30 },
      { name: "Tablet", value: 20 },
      { name: "Other", value: 10 },
    ],
  },
  bar: {
    type: "bar",
    data: [
      { name: "January", Mobile: 400, Desktop: 240 },
      { name: "February", Mobile: 300, Desktop: 139 },
      { name: "March", Mobile: 200, Desktop: 280 },
      { name: "April", Mobile: 278, Desktop: 390 },
    ],
  },
  radar: {
    type: "radar",
    data: [
      { feature: "Tracking", mobile: 15, desktop: 110, max: 150 },
      { feature: "Builder", mobile: 130, desktop: 90, max: 150 },
      { feature: "Schedule", mobile: 86, desktop: 130, max: 150 },
      { feature: "AI Train", mobile: 125, desktop: 40, max: 150 },
      { feature: "Interval", mobile: 148, desktop: 90, max: 150 },
    ],
  },
  line: {
    type: "line",
    data: [
      { name: "Jan", Returning: 275, New: 41 },
      { name: "Feb", Returning: 620, New: 96 },
      { name: "Mar", Returning: 202, New: 192 },
      { name: "Apr", Returning: 500, New: 50 },
      { name: "May", Returning: 355, New: 400 },
      { name: "Jun", Returning: 875, New: 200 },
      { name: "Jul", Returning: 700, New: 400 },
    ],
  },
  table: {
    type: "table",
    data: [
      { cusId: "#48149", sku: "Pro 1 Month", date: "Aug 2nd", price: "$9.75" },
      { cusId: "#1942s", sku: "Pro 3 Month", date: "Aug 2nd", price: "$21.25" },
      { cusId: "#4192", sku: "Pro 1 Year", date: "Aug 1st", price: "$94.75" },
      { cusId: "#99481", sku: "Pro 1 Month", date: "Aug 1st", price: "$9.44" },
      { cusId: "#1304", sku: "Pro 1 Month", date: "Aug 1st", price: "$9.23" },
      { cusId: "#1304", sku: "Pro 3 Month", date: "Jul 31st", price: "$22.02" },
    ],
  },
};


export const generateComponents = async (req, res) => {
  const { prompt } = req.body;

  await wait(2);

  const componentKeywords = ["pie", "bar", "radar", "line", "table"];
  const components = [];

  let mode = "append";
  if (/replace|change/i.test(prompt)) {
    mode = "replace";
  } else if (/add|append|create|insert/i.test(prompt)) {
    mode = "append";
  }

  componentKeywords.forEach((keyword) => {
    if (new RegExp(`\\b${keyword}\\b`, "i").test(prompt)) {
      components.push(chartData[keyword]);
    }
  });

  res.status(200).json({
    mode,
    components,
  });
};

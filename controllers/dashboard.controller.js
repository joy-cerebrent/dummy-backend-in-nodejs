import fs from 'fs';
import path from "path";
import wait from "../utils/wait.js";

const getMode = (prompt) => {
  let mode = "append";

  if (/replace|change|reset/i.test(prompt)) {
    mode = "replace";
  } else if (/add|append|create|insert|update/i.test(prompt)) {
    mode = "append";
  } else if (/remove|delete|erase/i.test(prompt)) {
    mode = "remove";
  }

  return mode;
}

const convertToCamelCase = (str) => {
  return str
    .toLowerCase()
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => (index === 0 ? word.toLowerCase() : word.toUpperCase()))
    .replace(/\s+/g, "");
};

export const generateComponents = async (req, res) => {
  const { prompt } = req.body;

  await wait(2);

  const componentKeywords = ["cards", "pie", "bar", "radar", "line", "table", "spreadsheet"];
  const components = [];

  const mode = getMode(prompt);

  const __dirname = path.resolve();
  const jsonFilePath = path.join(__dirname, "data", 'dashboardData.json');
  const rawData = fs.readFileSync(jsonFilePath, "utf-8");
  const dashboardData = JSON.parse(rawData);

  componentKeywords.forEach((keyword) => {
    if (new RegExp(`\\b${keyword}\\b`, "i").test(prompt)) {
      components.push(dashboardData[keyword]);
    }
  });

  res.status(200).json({
    mode,
    components,
  });
};

export const updateComponents = async (req, res, io) => {
  try {
    const { components } = req.body;

    if (!components || typeof components !== 'object') {
      return res.status(400).json({ error: "Invalid data format. Expected an object." });
    }

    const __dirname = path.resolve();
    const jsonFilePath = path.join(__dirname, "data", "dashboardData.json");

    const rawData = fs.readFileSync(jsonFilePath, "utf-8");
    const dashboardData = JSON.parse(rawData);

    Object.keys(components).forEach((key) => {
      if (dashboardData.hasOwnProperty(key)) {
        dashboardData[key] = components[key];
      }
    });

    fs.writeFileSync(jsonFilePath, JSON.stringify(dashboardData, null, 2), "utf-8");

    io.emit("updateDashboardData", Object.values(dashboardData));

    res.status(200).json({
      message: "Components updated successfully",
      updatedComponents: components,
    });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong while updating components." });
  }
};


const addValidation = (str) => {
  if (str.toLowerCase().includes("name")) {
    return {
      name: str,
      type: "text",
      minLength: 2,
      maxLength: 100,
      required: true,
    };
  } else if (str.toLowerCase().includes("email")) {
    return {
      name: str,
      type: "email",
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      required: true,
    };
  } else if (str.toLowerCase().includes("password")) {
    return {
      name: str,
      type: "password",
      minLength: 6,
      maxLength: 50,
      required: true,
    };
  } else if (str.toLowerCase().includes("username")) {
    return {
      name: str,
      type: "text",
      minLength: 4,
      maxLength: 50,
      required: true,
    };
  } else if (str.toLowerCase().includes("description")) {
    return {
      name: str,
      type: "description",
    };
  } else if (str.toLowerCase().includes("file")) {
    return {
      name: str,
      type: "fileUploader",
    };
  } else {
    return {
      name: str,
      required: false,
    };
  }
}

export const generateForm = async (req, res) => {
  const { prompt } = req.body;

  await wait(2);

  const formKeywords = ["first name", "last name", "username", "file uploader", "description", "email", "password"];
  var formComponents = [];

  const mode = getMode(prompt);

  formKeywords.forEach((keyword) => {
    if (new RegExp(`\\b${keyword}\\b`, "i").test(prompt)) {
      formComponents.push(convertToCamelCase(keyword));
    }
  });

  if (mode !== "remove") {
    formComponents = formComponents.map((component) => addValidation(component));
  }

  res.status(200).json({
    mode,
    components: formComponents,
  });
}
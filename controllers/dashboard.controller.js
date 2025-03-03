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

export const loadInitialData = async (req, res) => {
  const __dirname = path.resolve();
  const jsonFilePath = path.join(__dirname, "data", 'dashboardData.json');
  const rawData = fs.readFileSync(jsonFilePath, "utf-8");
  const dashboardData = JSON.parse(rawData);

  return res.status(200).json({
    components: Object.values(dashboardData).filter(c => c.defaultType !== "cards"),
  });
}

export const generateComponents = async (req, res) => {
  const { prompt } = req.body;

  await wait(2);

  const componentKeywords = ["cards", "time", "performance", "time_logged_in", "projects_done", "attendance", "productivity", "break_time", "sales_generated"];
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

  return res.status(200).json({
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
      pattern: new RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
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

  // res.status(200).json({
  //   mode,
  //   components: formComponents,
  // });

  res.status(200).json({
    mode: "append",
    steps: [
      {
        id: "Step 1",
        name: "Account Details",
        fields: [
          "username",
          "email",
          "password",
          "confirmPassword"
        ],
      },
      {
        id: "Step 2",
        name: "Personal Information",
        fields: [
          "firstName",
          "lastName",
          "description",
          "country",
          "state",
          "birthDate"
        ],
      },
      {
        id: "Step 3",
        name: "Account Details",
        fields: [
          "newsLetter",
          "agreeToTerms"
        ],
      },
    ],
    components: [
      {
        name: "firstName",
        type: "text",
        minLength: 2,
        maxLength: 100,
        required: true
      },
      {
        name: "lastName",
        type: "text",
        minLength: 2,
        maxLength: 100,
        required: true
      },
      {
        name: "country",
        type: "dropdown",
        options: ["USA", "Canada", "India", "Australia", "Germany", "UK"],
        required: true
      },
      {
        name: "state",
        type: "dropdown",
        options: {
          USA: ["California", "Texas", "New York", "Florida"],
          Canada: ["Ontario", "Quebec", "British Columbia"],
          India: ["Punjab", "Rajasthan", "Gujarat", "Maharashtra"],
          Australia: ["New South Wales", "Victoria", "Queensland"],
          Germany: ["Bavaria", "Berlin", "Hamburg"],
          UK: ["England", "Scotland", "Wales", "Northern Ireland"],
        },
        dependsOn: "country",
      },
      {
        name: "birthDate",
        type: "date",
        required: true,
      },
      {
        name: "username",
        type: "text",
        pattern: new RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
        minLength: 2,
        maxLength: 20,
      },
      {
        name: "email",
        type: "email",
        pattern: new RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
        required: true
      },
      {
        name: "password",
        type: "password",
        minLength: 8,
        required: true
      },
      {
        name: "confirmPassword",
        type: "confirmPassword",
        required: true,
      },
      {
        name: "description",
        type: "textarea",
        maxLength: 1000,
        required: false
      },
      {
        name: "newsLetter",
        type: "checkbox",
        title: "Subscribe to Newsletter",
        description: "Get all the latest updates, features, beta versions, and sneak peeks before everyone else.",
        default: true,
        required: false
      },
      {
        name: "agreeToTerms",
        type: "checkbox",
        title: "Agree to Terms",
        description: "You must agree to the terms and conditions to proceed.",
        required: true
      }
    ]
  });
}

export const saveFormData = async (req, res) => {
  await wait(2);

  try {
    const formData = req.body;

    if (!formData || typeof formData !== "object") {
      return res.status(400).json({ error: "Invalid data format. Expected an object." });
    }

    const __dirname = path.resolve();
    const jsonFilePath = path.join(__dirname, "data", "formData.json");

    let existingData = { responses: [] };

    if (fs.existsSync(jsonFilePath)) {
      const rawData = fs.readFileSync(jsonFilePath, "utf-8");
      existingData = rawData ? JSON.parse(rawData) : { responses: [] };
    }

    existingData.responses.push(formData);

    fs.writeFileSync(jsonFilePath, JSON.stringify(existingData, null, 2), "utf-8");

    res.status(200).json({
      message: "Form data saved successfully",
      savedData: formData,
    });
  } catch (error) {
    console.error("Error saving form data:", error);
    res.status(500).json({ error: "Something went wrong while saving form data." });
  }
};
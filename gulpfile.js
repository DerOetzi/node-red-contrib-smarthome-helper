const ts = require("gulp-typescript");
const tsProject = ts.createProject("tsconfig.json");

// General
const flatmap = require("gulp-flatmap");
const lazypipe = require("lazypipe");
const merge = require("merge-stream");
const wrap = require("gulp-wrap");
const { src, dest, task, parallel, watch, series } = require("gulp");

// Source
const buffer = require("gulp-buffer");
const rollupStream = require("@rollup/stream");
const rollupTypescript = require("@rollup/plugin-typescript");

const source = require("vinyl-source-stream");

const path = require("path");
const through = require("through2");
const fs = require("fs");
const glob = require("glob");

const jsonfile = require("jsonfile");

// HTML
const gulpHtmlmin = require("gulp-html-minifier-terser");

// Scripts
const terser = require("gulp-terser");

// Styles
const minify = require("cssnano");
const postcss = require("gulp-postcss");
const prefix = require("autoprefixer");
const sass = require("sass");

const editorFilePath = "dist";
const uiCssWrap = "<style><%= contents %></style>";
const uiJsWrap = '<script type="text/javascript"><%= contents %></script>';
const uiFormWrap =
  '<script type="text/html" data-template-name="<%= data.type %>"><%= data.contents %></script>';

const flowsFilePath = ".devcontainer/node-red-data/flows.json";
const flowsOutputDir = "examples";

let currentNode;

// Compile sass and wrap it
const buildSass = lazypipe()
  .pipe(() =>
    through.obj(async (file, _, cb) => {
      if (file.isBuffer()) {
        try {
          const result = await sass.compileAsync(file.path, {
            style: "expanded", // entspricht "outputStyle: expanded"
          });
          file.contents = Buffer.from(result.css);
          cb(null, file);
        } catch (err) {
          cb(err);
        }
      } else {
        cb(null, file);
      }
    }),
  )
  .pipe(postcss, [
    prefix({
      cascade: true,
      remove: true,
    }),
    minify({
      discardComments: {
        removeAll: true,
      },
    }),
  ])
  .pipe(wrap, uiCssWrap);

// Shrink js and wrap it
const buildJs = lazypipe().pipe(terser).pipe(wrap, uiJsWrap);

const buildForm = lazypipe()
  .pipe(gulpHtmlmin, {
    collapseWhitespace: true,
    minifyCSS: true,
  })
  .pipe(() => wrap(uiFormWrap, { type: currentNode }, { variable: "data" }));

/**
 * Helper function to escape HTML special characters
 */
function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Generates Node-RED help HTML from structured help data
 */
function generateHelpHtml(nodeType, helpData) {
  if (!helpData) {
    return "";
  }

  const sections = [];

  // Main description
  sections.push(`<p>${escapeHtml(helpData.description)}</p>`);

  // Inputs section
  if (helpData.inputs && Object.keys(helpData.inputs).length > 0) {
    sections.push("<h3>Inputs</h3>");
    sections.push('<dl class="message-properties">');
    for (const [key, input] of Object.entries(helpData.inputs)) {
      sections.push(`<dt>${escapeHtml(input.name)}`);
      sections.push(
        `<span class="property-type">msg.${escapeHtml(key)}</span>`,
      );
      sections.push("</dt>");
      sections.push(`<dd>${escapeHtml(input.description)}</dd>`);
    }
    sections.push("</dl>");
  }

  // Outputs section
  if (helpData.outputs && Object.keys(helpData.outputs).length > 0) {
    sections.push("<h3>Outputs</h3>");
    const outputKeys = Object.keys(helpData.outputs);

    if (outputKeys.length === 1) {
      sections.push('<dl class="message-properties">');
      const [key, output] = Object.entries(helpData.outputs)[0];
      sections.push(`<dt>${escapeHtml(output.name)}`);
      sections.push(
        `<span class="property-type">msg.${escapeHtml(key)}</span>`,
      );
      sections.push("</dt>");
      sections.push(`<dd>${escapeHtml(output.description)}</dd>`);
      sections.push("</dl>");
    } else {
      // Multiple outputs
      sections.push('<ol class="node-ports">');
      outputKeys.forEach((key) => {
        const output = helpData.outputs[key];
        sections.push(`<li>${escapeHtml(output.name)}`);
        sections.push('<dl class="message-properties">');
        sections.push(`<dt>${escapeHtml(key)}`);
        sections.push(
          `<span class="property-type">${escapeHtml(output.description)}</span>`,
        );
        sections.push("</dt>");
        sections.push("</dl>");
        sections.push("</li>");
      });
      sections.push("</ol>");
    }
  }

  // Details section
  if (helpData.details && helpData.details.length > 0) {
    sections.push("<h3>Details</h3>");
    helpData.details.forEach((detail) => {
      sections.push(`<p>${escapeHtml(detail.text)}</p>`);
    });
  }

  // Custom sections
  if (helpData.sections && helpData.sections.length > 0) {
    helpData.sections.forEach((section) => {
      if (section.title) {
        sections.push(`<h3>${escapeHtml(section.title)}</h3>`);
      }
      sections.push(`<p>${escapeHtml(section.content)}</p>`);
    });
  }

  const helpContent = sections.join("\n");
  return `<script type="text/html" data-help-name="${nodeType}">\n${helpContent}\n</script>\n`;
}

/**
 * Generates help HTML from locale files for all nodes
 */
function buildHelpFiles() {
  const localeFiles = {};

  // Read all locale files
  const localePattern = "src/nodes/**/locales/*.json";
  const files = glob.sync(localePattern);

  files.forEach((filePath) => {
    const relativePath = path.relative("src/nodes", filePath);
    const pathParts = relativePath.split(path.sep);

    const category = pathParts[0];
    let node;
    let languageFile;

    if (pathParts.length > 4) {
      languageFile = pathParts[4];
      node = pathParts[2];
    } else {
      languageFile = pathParts[3];
      node = pathParts[1];
    }

    const language = path.basename(languageFile, ".json");
    const content = JSON.parse(fs.readFileSync(filePath, "utf8"));

    const nodeType = `${category}-${node}`;

    if (!localeFiles[nodeType]) {
      localeFiles[nodeType] = {};
    }
    localeFiles[nodeType][language] = content;
  });

  // Generate help HTML for each node (use English as primary)
  let helpHtml = "";
  for (const [nodeType, locales] of Object.entries(localeFiles)) {
    const locale =
      locales["en-US"] || locales["de"] || Object.values(locales)[0];
    if (locale && locale.help) {
      helpHtml += generateHelpHtml(nodeType, locale.help);
    }
  }

  return helpHtml;
}

task("buildEditorFiles", () => {
  const css = src(["src/nodes/**/*.scss", "!_*.scss"]).pipe(buildSass());

  let cache;
  const js = rollupStream({
    input: "src/editor.ts",
    cache,
    output: {
      dir: editorFilePath,
      format: "iife",
    },
    plugins: [
      rollupTypescript({
        tsconfig: "tsconfig.editor.json",
      }),
    ],
    external: [],
  })
    .on("bundle", (bundle) => {
      cache = bundle;
    })
    .pipe(source("editor.ts"))
    .pipe(buffer())
    .pipe(buildJs());

  const html = src(["src/nodes/**/*.html"]).pipe(
    flatmap((stream, file) => {
      const [, category, , node] = file.path.match(
        /[\\/]src[\\/]nodes[\\/]([^\\/]+)[\\/]([^\\/]+[\\/])?([^\\/]+)[\\/]editor\.html/,
      );
      currentNode = category + "-" + node;
      return stream.pipe(buildForm());
    }),
  );

  return merge([css, js, html])
    .pipe(
      through.obj(function (file, _, cb) {
        // Sammle den Inhalt aller Dateien
        if (!this.concatContent) {
          this.concatContent = "";
        }
        if (file.isBuffer()) {
          this.concatContent += file.contents.toString() + "\n";
        }
        cb(null, file);
      }),
    )
    .on("finish", function () {
      const finalFilePath = path.join(editorFilePath, "index.html");
      // Generate and append help HTML
      const helpHtml = buildHelpFiles();
      fs.writeFileSync(finalFilePath, this.concatContent + helpHtml);
    });
});

task("buildSourceFiles", () => {
  return tsProject.src().pipe(tsProject()).js.pipe(dest(editorFilePath));
});

task("generateVersionFile", (cb) => {
  const packageJsonPath = path.join(__dirname, "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  const versionFilePath = path.join("src", "version.ts");
  const versionFileContent = `export default "${packageJson.version}";\n`;

  fs.writeFileSync(versionFilePath, versionFileContent);
  console.log(
    `Generated ${versionFilePath} with version ${packageJson.version}`,
  );
  cb();
});

task("copyIcons", () => {
  return src("icons/*").pipe(dest(`${editorFilePath}/icons`));
});

task("buildLocales", () => {
  return src(["src/nodes/**/locales/*.json", "src/locales/**/*.json"]).pipe(
    through.obj(function (file, _, cb) {
      if (file.isBuffer()) {
        const relativePath = path.relative("src/nodes", file.path);
        const pathParts = relativePath.split(path.sep);

        let category = pathParts[0];

        let languageFile;
        let node;

        if (category === ".." && pathParts[1] === "locales") {
          category = "common";
          languageFile = pathParts[3];
          node = pathParts[2];
        } else if (pathParts.length > 4) {
          languageFile = pathParts[4];
          node = pathParts[2];
        } else {
          languageFile = pathParts[3];
          node = pathParts[1];
        }

        const language = path.basename(languageFile, ".json");
        const content = JSON.parse(file.contents.toString());

        const outputPath = path.join("dist", "locales", language, "index.json");
        let existingData = {};
        if (fs.existsSync(outputPath)) {
          existingData = JSON.parse(fs.readFileSync(outputPath, "utf8"));
        }

        // Build hierarchical structure
        if (!existingData[category]) {
          existingData[category] = {};
        }
        existingData[category][node] = content;

        // Write back the updated structure
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, JSON.stringify(existingData, null, 2));
      }
      cb();
    }),
  );
});

function escapeFilename(label) {
  return label
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

task("examples", (cb) => {
  const flows = jsonfile.readFileSync(flowsFilePath);
  const tabs = flows.filter((item) => item.type === "tab");
  const groups = flows.filter((item) => item.type === "group");
  const nodes = flows.filter((item) => !["tab", "group"].includes(item.type));

  tabs.forEach((tab) => {
    const tabId = tab.id;
    const tabLabel = escapeFilename(tab.label);
    const tabGroups = groups.filter((group) => group.z === tabId);
    const tabNodes = nodes.filter(
      (node) => node.z === tabId || tabGroups.some((g) => g.id === node.g),
    );

    const output = [tab, ...tabGroups, ...tabNodes];

    const outputPath = `${flowsOutputDir}/${tabLabel}.json`;
    jsonfile.writeFileSync(outputPath, output, { spaces: 2 });
    console.log(`Created ${outputPath}`);
  });

  cb();
});

task(
  "default",
  series(
    "generateVersionFile",
    parallel([
      "buildEditorFiles",
      "buildSourceFiles",
      "copyIcons",
      "buildLocales",
      "examples",
    ]),
  ),
);

task("watch", () => {
  watch(["package.json"], series("generateVersionFile"));
  watch(["src/nodes/**/*.scss"], series("buildEditorFiles"));
  watch(["src/nodes/**/*.html"], series("buildEditorFiles"));
  watch(["src/**/*.ts"], series("buildEditorFiles"));

  watch(["src/**/*.ts", "!src/**/editor.ts"], series("buildSourceFiles"));

  watch(
    ["src/nodes/**/locales/*.json", "src/locales/**/*.json"],
    series("buildLocales"),
  );

  watch(["icons/*"], series("copyIcons"));
});

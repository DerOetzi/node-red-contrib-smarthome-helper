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
      const [, category, node] = file.path.match(
        /[\\/]src[\\/]nodes[\\/]([^\\/]+)[\\/]([^\\/]+)[\\/]editor\.html/,
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
      fs.writeFileSync(finalFilePath, this.concatContent);
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
  return src("src/nodes/**/locales/*.json").pipe(
    through.obj(function (file, _, cb) {
      if (file.isBuffer()) {
        const relativePath = path.relative("src/nodes", file.path);
        const [category, node, , languageFile] = relativePath.split(path.sep);
        const language = path.basename(languageFile, ".json");
        const content = JSON.parse(file.contents.toString());

        // Load existing structure or initialize it
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

task(
  "default",
  series(
    "generateVersionFile",
    parallel([
      "buildEditorFiles",
      "buildSourceFiles",
      "copyIcons",
      "buildLocales",
    ]),
  ),
);

task("watch", () => {
  watch(["package.json"], series("generateVersionFile"));
  watch(["src/nodes/**/*.scss"], series("buildEditorFiles"));
  watch(["src/nodes/**/*.html"], series("buildEditorFiles"));
  watch(["src/**/*.ts"], series("buildEditorFiles"));

  watch(["src/**/*.ts", "!src/**/editor.ts"], series("buildSourceFiles"));

  watch(["src/nodes/**/locales/*.json"], series("buildLocales"));

  watch(["icons/*"], series("copyIcons"));
});

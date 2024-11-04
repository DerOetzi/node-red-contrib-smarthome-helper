const ts = require("gulp-typescript");
const tsProject = ts.createProject("tsconfig.json");

// General
const concat = require("gulp-concat");
const flatmap = require("gulp-flatmap");
const lazypipe = require("lazypipe");
const merge = require("merge-stream");
const wrap = require("gulp-wrap");
const { src, dest, task, parallel } = require("gulp");
const appendPrepend = require("gulp-append-prepend");

// Source
const buffer = require("gulp-buffer");
const rollupStream = require("@rollup/stream");
const rollupTypescript = require("@rollup/plugin-typescript");
const source = require("vinyl-source-stream");

// HTML
const gulpHtmlmin = require("gulp-html-minifier-terser");

// Scripts
const terser = require("gulp-terser");

// Styles
const minify = require("cssnano");
const postcss = require("gulp-postcss");
const prefix = require("autoprefixer");
const sass = require("gulp-sass")(require("sass"));

const editorFilePath = "dist";
const uiCssWrap = "<style><%= contents %></style>";
const uiJsWrap = '<script type="text/javascript"><%= contents %></script>';
const uiFormWrap =
  '<script type="text/html" data-template-name="<%= data.type %>"><%= data.contents %></script>';

let currentNode;

// Compile sass and wrap it
const buildSass = lazypipe()
  .pipe(sass, {
    outputStyle: "expanded",
    sourceComments: true,
  })
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
      if (category === "flowctrl" && node === "base") {
        return stream.pipe(buildForm());
      } else {
        return stream
          .pipe(appendPrepend.appendFile("src/nodes/flowctrl/base/editor.html"))
          .pipe(buildForm());
      }
    }),
  );

  return merge([css, js, html])
    .pipe(concat("index.html"))
    .pipe(dest(editorFilePath + "/"));
});

task("buildSourceFiles", () => {
  return tsProject.src().pipe(tsProject()).js.pipe(dest(editorFilePath));
});

task("copyIcons", () => {
  return src("icons/*").pipe(dest(`${editorFilePath}/icons`));
});

task(
  "default",
  parallel(["buildEditorFiles", "buildSourceFiles", "copyIcons"]),
);

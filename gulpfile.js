import { task, dest, src, series } from "gulp";
import { createProject } from "gulp-typescript";
const tsProject = createProject("tsconfig.json");

// Task zum Kompilieren von TypeScript
task("scripts", function () {
  return tsProject.src().pipe(tsProject()).pipe(dest("nodes"));
});

// Task zum Kopieren der HTML-Dateien
task("copy-html", function () {
  return src("src/**/*.html").pipe(dest("nodes"));
});

// Default task, der beide Tasks ausführt
task("default", series("scripts", "copy-html"));

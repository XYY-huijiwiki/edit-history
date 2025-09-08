import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import { visualizer } from "rollup-plugin-visualizer";
// import fs from "node:fs";
// import path from "node:path";

const appId = "dcb40fa"; // Definiere die App-ID hier

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), cssInjectedByJsPlugin() /*postBuildPlugin(appId)*/],
  server: {
    cors: true,
  },
  build: {
    manifest: true,
    rollupOptions: {
      plugins: [visualizer({ filename: "./dist/stats.html" })],
    },
  },
  define: {
    __APP_ID__: JSON.stringify(appId),
  },
});

// interface postBuildPluginParams {
//   appId: string;
//   username: string;
//   password: string;
//   apiUrl: string;
//   userAgent?: string;
//   pageName?: string;
//   pageId?: string;
//   wikiText?: string;
//   wikiTextFile?: string;
//   editSummary: string;
//   append?: boolean;
//   prepend?: boolean;
//   minor?: boolean;
// }
// function postBuildPlugin(options: postBuildPluginParams) {
//   const {
//     appId,
//     username,
//     password,
//     apiUrl,
//     userAgent = "mediawiki-edit-bot",
//     pageName,
//     pageId,
//     wikiText,
//     wikiTextFile,
//     editSummary,
//     append = false,
//     prepend = false,
//     minor = false,
//   } = options;

//   return {
//     name: "post-build-plugin",
//     async closeBundle() {
//       // Manifest-Typ definieren
//       type Manifest = {
//         [key: string]: {
//           file: string;
//           // ...weitere Felder, falls benötigt...
//         };
//       };

//       // Manifest laden
//       const manifestPath = path.join(__dirname, "./dist/.vite/manifest.json");
//       const manifest: Manifest = JSON.parse(
//         fs.readFileSync(manifestPath, "utf-8")
//       );

//       // JS-Datei aus Manifest holen
//       const jsFileRel: string = manifest["index.html"].file;
//       const jsFilePath = path.join(__dirname, "./dist/", jsFileRel);
//       const jsContent = fs.readFileSync(jsFilePath, "utf-8");

//       // TXT-Inhalt zusammenbauen
//       const txtContent = `<!--

//     请勿在此处修改代码！请勿在此处修改代码！请勿在此处修改代码！

//     - 源代码储存在GitHub上：https://github.com/XYY-huijiwiki/edit-history
//     - 请在GitHub上修改代码
//     - GitHub上的代码会自动同步到此处

// -->
// <div id="${appId}"></div>
// <script type="module">
// eval(${JSON.stringify(jsContent)});
// </script>
// `;

//       // Validate inputs
//       if (!pageName && !pageId) {
//         throw new Error("No Page Name or Page ID Specified");
//       }

//       if (!wikiText && !wikiTextFile) {
//         throw new Error("No Text or File Specified");
//       }

//       if (append && prepend) {
//         console.warn("Both Prepend and Append Specified, will append");
//       }

//       // Get page content
//       let editText: string;
//       if (wikiTextFile) {
//         editText = fs.readFileSync(wikiTextFile, "utf8");
//       } else {
//         editText = wikiText!;
//       }

//       // Initialize bot
//       const bot = await Mwn.init({
//         apiUrl,
//         username,
//         password,
//         userAgent,
//         defaultParams: {
//           assert: "user",
//         },
//       });

//       // Prepare edit parameters
//       const editParams: any = {
//         bot: true,
//         summary: editSummary,
//       };

//       if (append) {
//         editParams.appendtext = editText;
//       } else if (prepend) {
//         editParams.prependtext = editText;
//       } else {
//         editParams.text = editText;
//       }

//       if (minor) {
//         editParams.minor = true;
//       }

//       // Execute edit
//       const pageIdentifier = pageId || pageName!;
//       const result = await bot.edit(pageIdentifier, () => editParams);

//       if (result.result !== "Success") {
//         throw new Error(`Edit returned status of: ${result.result}`);
//       }

//       if ("nochange" in result) {
//         console.warn("Page did not change with edit");
//       }

//       console.log(
//         `Successfully edited page: "${result.title}" with id: ${result.pageid}`
//       );
//     },
//   };
// }

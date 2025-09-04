import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import fs from "node:fs";
import path from "node:path";

const appId = "dcb40fa"; // Definiere die App-ID hier

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), cssInjectedByJsPlugin(), postBuildPlugin(appId)],
  server: {
    cors: true,
  },
  build: {
    manifest: true,
  },
  define: {
    __APP_ID__: JSON.stringify(appId),
  },
});

// Beispiel für ein einfaches Postbuild-Plugin
function postBuildPlugin(appId: string) {
  return {
    name: "post-build-plugin",
    closeBundle() {
      // Manifest-Typ definieren
      type Manifest = {
        [key: string]: {
          file: string;
          // ...weitere Felder, falls benötigt...
        };
      };

      // Manifest laden
      const manifestPath = path.join(__dirname, "./dist/.vite/manifest.json");
      const manifest: Manifest = JSON.parse(
        fs.readFileSync(manifestPath, "utf-8")
      );

      // JS-Datei aus Manifest holen
      const jsFileRel: string = manifest["index.html"].file;
      const jsFilePath = path.join(__dirname, "./dist/", jsFileRel);
      const jsContent = fs.readFileSync(jsFilePath, "utf-8");

      // TXT-Inhalt zusammenbauen
      const txtContent = `<!--

    请勿在此处修改代码！请勿在此处修改代码！请勿在此处修改代码！

    - 源代码储存在GitHub上：https://github.com/XYY-huijiwiki/edit-history
    - 请在GitHub上修改代码
    - GitHub上的代码会自动同步到此处

-->
<div id="${appId}"></div>
<script type="module">
eval(${JSON.stringify(jsContent)});
</script>
`;

      // TXT-Datei schreiben
      fs.writeFileSync(
        path.join(__dirname, "./dist/output.txt"),
        txtContent,
        "utf-8"
      );
      console.log("output.txt wurde erstellt.");
    },
  };
}

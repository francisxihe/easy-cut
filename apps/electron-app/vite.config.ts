import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import electron from "vite-plugin-electron";
import renderer from "vite-plugin-electron-renderer";

export default async () => {
  const tailwindcss = await import("@tailwindcss/vite").then((m) => m.default);
  return defineConfig({
    css: {
      modules: {
        localsConvention: "camelCase",
        generateScopedName: "[name]__[local]___[hash:base64:5]",
      },
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
          modifyVars: {
            // 可以在这里定义全局 Less 变量
          },
        },
      },
    },
    plugins: [
      tailwindcss(),
      react(),
      electron([
        {
          entry: "electron/main/main.ts",
          onstart(options) {
            if (options.startup) {
              options.startup();
            }
          },
          vite: {
            build: {
              sourcemap: true,
              minify: false,
              outDir: "dist-electron",
              rollupOptions: {
                external: ["electron"],
              },
            },
          },
        },
        {
          entry: "electron/preload.ts",
          onstart(options) {
            options.reload();
          },
          vite: {
            build: {
              sourcemap: "inline",
              minify: false,
              outDir: "dist-electron",
              rollupOptions: {
                external: ["electron"],
              },
            },
          },
        },
      ]),
      renderer(),
    ],
    server: {
      port: 8200,
      host: "localhost",
      strictPort: true,
    },
  });
};

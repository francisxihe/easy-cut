import { createRoot } from "react-dom/client";
import "@arco-design/web-react/dist/css/arco.css";
import App from "./App";
import "./index.css";

console.log("🚀 React main.tsx 开始执行");
console.log("当前时间:", new Date().toLocaleString());

const rootElement = document.getElementById("root");
console.log("Root 元素:", rootElement);
console.log("Root 元素内容:", rootElement?.innerHTML.substring(0, 100));

if (rootElement) {
  // 清空回退内容
  console.log("清空 HTML 回退内容，准备渲染 React 应用");

  const root = createRoot(rootElement);
  root.render(<App />);

  console.log("✅ React 应用渲染完成");
} else {
  console.error("❌ 找不到 root 元素");
}

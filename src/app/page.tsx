import JsonViewer from "@/components/json-viewer/JsonViewer";
import NavBar from "@/components/nav-bar/NavBar";
import { JSON_VIEWER_APP } from "@/model/application/Application";

export default function App() {
  return (
    <main className="min-h-screen flex justify-center">
      <NavBar
        isDarkTheme={false}
        backgroundColour="#fdfeff"
        currentApp={JSON_VIEWER_APP}
      ></NavBar>
      <JsonViewer></JsonViewer>
    </main>
  );
}

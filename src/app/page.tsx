import JsonViewer from "@/components/json-viewer/JsonViewer";
import NavBar from "@/components/nav-bar/NavBar";

export default function App() {
  return (
    <main className="flex h-full flex-col justify-center">
      <NavBar />
      <JsonViewer></JsonViewer>
    </main>
  );
}

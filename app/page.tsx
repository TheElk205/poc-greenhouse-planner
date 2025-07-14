import GreenhouseVisualizer from "@/components/greenhouse-visualizer";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex flex-col">
      <div className="flex-1">
        <GreenhouseVisualizer initialRow1="[1-8]" initialRow2="[9-17]" />
      </div>
      <footer className="mt-auto py-4 text-center text-sm text-gray-500">
        Crafted with intelligence by Claude
      </footer>
    </div>
  );
}

import RecipeGenerator from "@/components/RecipeGenerator";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50">
      <Navbar />
      <RecipeGenerator />
    </main>
  );
}
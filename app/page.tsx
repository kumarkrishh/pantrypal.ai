import RecipeGenerator from "@/components/home";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
      <RecipeGenerator />
    </main>
  );
}
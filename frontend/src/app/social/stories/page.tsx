//  frontend/src/app/social/stories/page.tsx
export default function StoriesPage() {
  return (
    <div className="p-8">

      <h1 className="text-4xl font-bold mb-6">
        Stories
      </h1>

      <div className="flex gap-4">

        <div className="w-24 h-24 rounded-full bg-blue-500"></div>
        <div className="w-24 h-24 rounded-full bg-green-500"></div>
        <div className="w-24 h-24 rounded-full bg-purple-500"></div>

      </div>

    </div>
  );
}

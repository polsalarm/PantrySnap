export default function TopBar({ title }: { title: string }) {
  return (
    <header className="bg-bg flex items-center w-full px-5 py-3 max-w-2xl mx-auto sticky top-0 z-40">
      <h1 className="text-2xl font-bold text-primary tracking-tight">{title}</h1>
    </header>
  );
}

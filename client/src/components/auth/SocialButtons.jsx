export default function SocialButtons() {
  const socials = [
    {
      icon: "G",
      color: "text-red-500",
    },
    {
      icon: "f",
      color: "text-blue-600",
    },
    {
      icon: "in",
      color: "text-sky-700",
    },
    {
      icon: "◉",
      color: "text-pink-500",
    },
  ];

  return (
    <div className="flex items-center gap-4 mb-8">
      {socials.map((item, index) => (
        <button
          key={index}
          className="cursor-pointer w-14 h-14 rounded-full border border-gray-300 bg-white flex items-center justify-center text-xl font-bold shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
        >
          <span className={item.color}>{item.icon}</span>
        </button>
      ))}
    </div>
  );
}
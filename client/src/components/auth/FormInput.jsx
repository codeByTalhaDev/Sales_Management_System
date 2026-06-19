export default function FormInput({
  type,
  placeholder,
  name,
  value,
  onChange,
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-5 py-4 rounded-full border border-gray-300 bg-white outline-none focus:ring-2 focus:ring-orange-400 transition"
    />
  );
}
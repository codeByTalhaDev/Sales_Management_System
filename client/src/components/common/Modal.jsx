import { X } from "lucide-react";

const Modal = ({ isOpen, title, children, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="
      fixed inset-0 z-[999]
      bg-black/40
      flex items-center justify-center
      px-4
      "
    >
      <div
        className="
        bg-white
        w-full
        max-w-lg
        rounded-2xl
        shadow-xl
        overflow-hidden
        "
      >
        <div
          className="
          flex items-center justify-between
          px-5 py-4
          border-b border-gray-200
          "
        >
          <h2 className="text-lg font-bold text-gray-800">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="
            p-2
            rounded-lg
            hover:bg-orange-50
            text-gray-500
            hover:text-orange-500
            cursor-pointer
            "
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
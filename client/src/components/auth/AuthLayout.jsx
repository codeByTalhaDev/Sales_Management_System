import { Link } from "react-router-dom";
import SocialButtons from "./SocialButtons";

export default function AuthLayout({
  title,
  sideTitle,
  sideText,
  sideButtonText,
  sideButtonLink,
  children,
  showSocial = true,
  showEmailText = true,
}) {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 overflow-hidden">

      <div className="w-full max-w-5xl bg-white rounded-[40px] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 animate-[fadeIn_0.7s_ease-in-out]">

        {/* LEFT */}
        <div className="flex flex-col justify-center items-center px-6 sm:px-10 lg:px-10 py-6">

          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-8 mt-8">
            {title}
          </h1>

          {showSocial && <SocialButtons />}

          {showEmailText && (
            <p className="text-gray-500 text-center mb-8 text-sm sm:text-base">
              Or use your email password
            </p>
          )}

          {children}

        </div>

        {/* RIGHT */}
        <div className="relative bg-orange-500 text-white flex items-center justify-center px-8 py-8 lg:rounded-l-[120px]">

          <div className="text-center max-w-md animate-[slideUp_0.8s_ease-in-out]">

            <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
              {sideTitle}
            </h1>

            <p className="text-base sm:text-lg text-orange-100 leading-relaxed mb-10">
              {sideText}
            </p>

            <Link to={sideButtonLink}>
              <button className="border border-white px-10 py-3 rounded-full font-semibold tracking-wide hover:bg-white hover:text-orange-500 transition-all duration-300 hover:scale-105 cursor-pointer">
                {sideButtonText}
              </button>
            </Link>

          </div>

          <div className="absolute top-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>

          <div className="absolute bottom-10 left-10 w-40 h-40 bg-yellow-300/20 rounded-full blur-3xl"></div>

        </div>
      </div>
    </div>
  );
}
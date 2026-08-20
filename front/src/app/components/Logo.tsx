import { Link } from "react-router";

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-1 group">
      <div className="w-10 h-10 group-hover:scale-110 transition-transform">
        <svg
          width="40"
          height="40"
          viewBox="0 0 44 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="44" height="44" rx="12" fill="url(#bg)" />
          <path
            d="M4 19 Q12 11 22 14.5 Q32 11 40 19 Q36 33 22 35 Q8 33 4 19Z"
            fill="#3FA9F5"
            fillOpacity="0.2"
            stroke="#3FA9F5"
            strokeWidth="3.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6.5 19 Q22 21.5 37.5 19 L37 25 Q22 28 7 25 Z"
            fill="#3FA9F5"
            fillOpacity="0.95"
          />
          <line
            x1="14.5"
            y1="19.5"
            x2="14"
            y2="24.5"
            stroke="#3FA9F5"
            strokeWidth="1"
            opacity="0.4"
          />
          <line
            x1="22"
            y1="20"
            x2="22"
            y2="25.5"
            stroke="#3FA9F5"
            strokeWidth="1"
            opacity="0.4"
          />
          <line
            x1="29.5"
            y1="19.5"
            x2="30"
            y2="24.5"
            stroke="#3FA9F5"
            strokeWidth="1"
            opacity="0.4"
          />
          <path
            d="M7 25 Q22 29.5 37 25 Q35 33 22 35 Q9 33 7 25Z"
            fill="#3FA9F5"
            fillOpacity="0.08"
          />
          <path
            d="M14 39 Q22 42 30 39"
            stroke="#3FA9F5"
            strokeWidth="2.2"
            strokeLinecap="round"
            opacity="0.5"
          />
        </svg>
      </div>
      <span className="text-3xl font-bold bg-gradient-to-r from-[#3FA9F5] to-[#1F6FEB] bg-clip-text text-transparent">
        Ora AI
      </span>
    </Link>
  );
}

export default Logo;

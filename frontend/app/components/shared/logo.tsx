import serviceConfig from "~/config/serviceConfig";

interface LogoProps {
  className?: string;
}

export const WideLogo = ({ className }: LogoProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 880 220"
      role="img"
      aria-labelledby="title desc"
      className={className}
      aria-label={`${serviceConfig.name} Logo`}
    >
      <title id="title">Rails React Boilertemplate Logo</title>
      <desc id="desc">An abstract logo combining React-like orbits and stylized rails with a wordmark.</desc>
      <style>
        {`:root {
          --rails: #D3002D;
          --react: #61DAFB;
          --ink:   #0F172A;
        }
        .dark { --ink:#E5E7EB; }
        text { font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }`}
      </style>

      <g transform="translate(110,110)">
        <ellipse rx="58" ry="22" fill="none" stroke="var(--react)" strokeWidth="8" />
        <ellipse rx="58" ry="22" fill="none" stroke="var(--react)" strokeWidth="8" transform="rotate(60)" />
        <ellipse rx="58" ry="22" fill="none" stroke="var(--react)" strokeWidth="8" transform="rotate(120)" />
        <circle r="10" fill="var(--react)" />
        <path d="M0,-36 L18,-18 L0,0 L-18,-18 Z" fill="var(--rails)" />
        <g transform="translate(0,35)">
          <line x1="-70" y1="28" x2="70" y2="28" stroke="var(--rails)" strokeWidth="6" strokeLinecap="round" />
          <line x1="-70" y1="48" x2="70" y2="48" stroke="var(--rails)" strokeWidth="6" strokeLinecap="round" />
          <g fill="var(--rails)">
            <rect x="-60" y="30" width="8" height="16" rx="2" />
            <rect x="-36" y="30" width="8" height="16" rx="2" />
            <rect x="-12" y="30" width="8" height="16" rx="2" />
            <rect x="12" y="30" width="8" height="16" rx="2" />
            <rect x="36" y="30" width="8" height="16" rx="2" />
            <rect x="60" y="30" width="8" height="16" rx="2" />
          </g>
        </g>
      </g>

      <g transform="translate(260,120)" fill="var(--ink)">
        <text x="0" y="0" fontSize="56" fontWeight="700" letterSpacing=".5" dominantBaseline="middle">
          Rails React
        </text>
        <text x="2" y="42" fontSize="28" fontWeight="500" opacity=".85" letterSpacing=".2" dominantBaseline="hanging">
          Boilertemplate
        </text>
      </g>
    </svg>
  );
};

export const Logo = ({ className }: LogoProps) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 220" role="img" aria-label="RRB icon" className={className}>
      <style>{`:root { --rails:#D3002D; --react:#61DAFB; }`}</style>
      <rect width="220" height="220" rx="28" fill="#0B1220" />
      <g transform="translate(110,110)">
        <ellipse rx="58" ry="22" fill="none" stroke="var(--react)" strokeWidth="10" />
        <ellipse rx="58" ry="22" fill="none" stroke="var(--react)" strokeWidth="10" transform="rotate(60)" />
        <ellipse rx="58" ry="22" fill="none" stroke="var(--react)" strokeWidth="10" transform="rotate(120)" />
        <circle r="12" fill="var(--react)" />
        <path d="M0,-40 L20,-20 L0,0 L-20,-20 Z" fill="var(--rails)" />
        <g transform="translate(0,38)">
          <line x1="-70" y1="28" x2="70" y2="28" stroke="var(--rails)" strokeWidth="8" strokeLinecap="round" />
          <line x1="-70" y1="50" x2="70" y2="50" stroke="var(--rails)" strokeWidth="8" strokeLinecap="round" />
          <g fill="var(--rails)">
            <rect x="-60" y="32" width="10" height="16" rx="2" />
            <rect x="-36" y="32" width="10" height="16" rx="2" />
            <rect x="-12" y="32" width="10" height="16" rx="2" />
            <rect x="12" y="32" width="10" height="16" rx="2" />
            <rect x="36" y="32" width="10" height="16" rx="2" />
            <rect x="60" y="32" width="10" height="16" rx="2" />
          </g>
        </g>
      </g>
    </svg>
  );
};

import { cn } from "@/shared/lib/utils";
import { FlickeringGrid } from "@/shared/components/dupui/flickering-grid";
import { ReactNode } from "react";

interface GlowProps {
  children?: ReactNode;
  className?: string;
}

export function Glow({ children, className }: GlowProps) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Flickering grid base layer */}
      <FlickeringGrid
        className="absolute inset-0 z-0 [mask-image:radial-gradient(ellipse_100%_60%_at_50%_0%,white,transparent)]"
        squareSize={4}
        gridGap={6}
        color="#2DD4BF"
        maxOpacity={0.4}
        flickerChance={0.08}
      />

      {/* Radial glow */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(100% 70% at 50% 0%, rgba(17, 94, 89, 0.4) 0%, rgba(17, 94, 89, 0) 100%)",
        }}
      />

      {/* V-shape light rays */}
      <div className="absolute inset-0 z-0 flex justify-center pointer-events-none">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1184"
          height="344"
          viewBox="0 0 1184 344"
          className="w-full h-full"
          fill="none"
        >
          <g filter="url(#glow-v-a)" opacity="0.4">
            <path
              fill="#2DD4BF"
              d="m590.328 354.976 5.344-5.952-37.329-37.284-671.926-671.1-37.329-37.283-80.176 89.286 41.071 33.117 739.274 596.1 41.071 33.116Z"
            />
          </g>
          <g filter="url(#glow-v-b)" opacity="0.4">
            <path
              fill="#2DD4BF"
              d="m593.672 354.976-5.344-5.952 37.329-37.284c223.975-223.7 447.953-447.399 671.923-671.1 12.45-12.427 24.89-24.855 37.33-37.283 26.73 29.762 53.45 59.524 80.18 89.286l-41.07 33.117c-246.43 198.7-492.852 397.4-739.277 596.1l-41.071 33.116Z"
            />
          </g>
          <defs>
            <filter
              id="glow-v-a"
              width="1066.76"
              height="991.619"
              x="-351.088"
              y="-516.643"
              colorInterpolationFilters="sRGB"
              filterUnits="userSpaceOnUse"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
              <feGaussianBlur result="blur" stdDeviation="60" />
            </filter>
            <filter
              id="glow-v-b"
              width="1066.76"
              height="991.619"
              x="468.328"
              y="-516.643"
              colorInterpolationFilters="sRGB"
              filterUnits="userSpaceOnUse"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
              <feGaussianBlur result="blur" stdDeviation="60" />
            </filter>
          </defs>
        </svg>
      </div>

      {/* Texture overlay */}
      <div
        className="absolute inset-0 z-0 opacity-30 mix-blend-overlay pointer-events-none"
        style={{
          maskImage:
            "radial-gradient(50% 100% at 50% 0%, #FFFFFF 0%, rgba(255, 255, 255, 0) 100%)",
          WebkitMaskImage:
            "radial-gradient(50% 100% at 50% 0%, #FFFFFF 0%, rgba(255, 255, 255, 0) 100%)",
        }}
      />

      {/* Content */}
      {children && <div className="relative z-10">{children}</div>}
    </div>
  );
}

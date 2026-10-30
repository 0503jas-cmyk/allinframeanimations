import React from 'react';
import {P, rgba} from '../kit';

/** A woman in a long coat seen from behind, hand on the door frame: flat silhouette with rim light. Ground point (x,y); height ~ 830*scale. No face. */
export const WomanBack: React.FC<{x: number; y: number; scale?: number; fill?: string; rim?: string; sway?: number; flipX?: number}> = ({x, y, scale = 1, fill = '#03060e', rim = rgba(P.amberHot, 0.75), sway = 0, flipX = 1}) => (
  <svg width={1} height={1} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none'}}>
    <g transform={`translate(${x},${y}) scale(${scale * flipX},${scale})`}>
      <g transform={`translate(-200,-860) rotate(${sway} 200 860)`}>
        {/* coat */}
        <path d="M140 190C110 205 92 250 86 320L60 560C50 690 40 780 34 858L366 858C360 780 350 690 340 560L314 320C308 250 290 205 260 190Z" fill={fill} />
        {/* shawl / cape over the shoulders */}
        <path d="M122 204C134 176 266 176 278 204C304 234 320 282 322 338C262 362 138 362 78 338C80 282 96 234 122 204Z" fill="#0a1230" />
        {/* neck + head + bun */}
        <path d="M178 150H222V196H178Z" fill={fill} />
        <ellipse cx={200} cy={118} rx={44} ry={54} fill={fill} />
        <circle cx={206} cy={58} r={24} fill={fill} />
        <path d="M156 100C170 70 232 70 246 100" fill="none" stroke="#0a1230" strokeWidth={6} />
        {/* right arm raised, hand on the frame */}
        <path d="M292 232C338 252 374 282 388 334C394 300 396 250 394 204L372 200C366 232 352 252 330 240C316 228 304 222 292 218Z" fill={fill} />
        <ellipse cx={386} cy={186} rx={15} ry={28} fill={fill} />
        {/* left arm hanging, a small bag */}
        <path d="M112 232C76 290 62 380 70 470L106 472C106 390 124 316 150 268Z" fill={fill} />
        <rect x={54} y={466} width={70} height={76} rx={12} fill="#0a1230" />
        {/* folds */}
        <path d="M150 340C140 520 120 700 100 858M200 330V858M260 340C270 520 290 700 310 858" stroke="#0b1430" strokeWidth={5} fill="none" />
        {/* rim light on the lamp side */}
        <path d="M128 176C98 196 74 250 70 330L46 570C40 700 36 790 30 858" fill="none" stroke={rim} strokeWidth={4} />
        <path d="M156 100C158 74 176 64 192 62" fill="none" stroke={rim} strokeWidth={3} />
      </g>
    </g>
  </svg>
);

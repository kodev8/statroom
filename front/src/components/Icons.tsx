import { twMerge } from 'tailwind-merge';
import { Link } from 'react-router-dom';
import React from 'react';

interface IconProps {
    height: number;
    width: number;
    className?: string;
    navigateTo?: string;
    asIcon?: boolean;
}

export const StatRoomLogo = ({
    height = 16,
    width = 16,
    navigateTo = '/',
    className,
    asIcon = false,
}: IconProps) => {
    const image = asIcon ? '/statroom-icon.png' : '/statroom-logo.png';
    return !asIcon ? (
        <Link
            to={navigateTo}
            className={twMerge('rounded-xl cursor-pointer', className)}
        >
            <img
                src={image}
                alt=""
                height={height}
                width={width}
                className="rounded-xl"
            />
        </Link>
    ) : (
        <svg
            version="1.0"
            xmlns="http://www.w3.org/2000/svg"
            className={twMerge('rounded-xl cursor-pointer', className)}
            height={height}
            width={width}
            fill="#64748b"
            viewBox="0 0 96 96"
            preserveAspectRatio="xMidYMid meet"
        >
            <g
                transform="translate(0.000000,87.000000) scale(0.050000,-0.050000)"
                fill="#64748b"
                stroke="none"
            >
                <path
                    d="M537 1522 c-40 -33 -46 -54 -43 -150 3 -82 -3 -112 -23 -112 -54 0
-145 -134 -181 -267 -36 -133 -64 -159 -109 -104 -46 55 -2 154 122 276 130
126 134 140 22 66 -268 -177 -309 -376 -92 -452 49 -17 59 -30 52 -67 -13 -67
66 -209 169 -306 85 -80 87 -84 47 -106 -96 -51 -183 60 -229 294 l-27 136 -3
-124 c-5 -281 126 -452 287 -375 41 19 79 47 84 61 8 19 26 16 74 -13 72 -44
129 -48 272 -17 130 28 130 50 0 41 -234 -16 -313 41 -239 173 87 151 122 158
245 45 294 -268 163 -462 -202 -300 -119 53 -128 35 -17 -30 267 -156 503 -89
465 131 -10 61 -4 72 54 108 73 46 109 109 155 276 l32 117 47 -38 c71 -58 42
-133 -111 -280 -144 -139 -146 -154 -9 -66 259 166 301 410 80 454 -49 10 -57
20 -47 57 21 84 -163 370 -238 370 -12 0 2 -25 30 -55 195 -207 183 -383 -25
-359 -138 17 -145 24 -129 131 65 443 323 447 382 7 20 -153 34 -126 24 46
-18 319 -182 464 -349 308 -41 -40 -47 -40 -90 -10 -57 39 -261 42 -347 4 -56
-25 -48 -26 104 -24 258 3 305 -83 140 -263 -22 -25 -49 -45 -60 -45 -56 0
-252 202 -262 270 -2 16 -10 35 -18 43 -97 97 104 160 311 98 125 -38 121 -21
-10 40 -131 60 -271 65 -338 11z m55 -381 c89 -135 78 -200 -42 -243 -152 -55
-277 -51 -259 7 45 146 170 315 231 315 10 0 41 -36 70 -79z m305 -238 c15
-10 23 -42 20 -75 -9 -78 -123 -88 -134 -12 -11 79 51 126 114 87z m523 -102
c0 -51 -102 -237 -158 -290 -87 -82 -188 -11 -215 151 l-11 71 127 43 c135 45
257 57 257 25z m-803 -54 c57 -15 50 -141 -17 -297 -49 -113 -60 -112 -149 9
-168 228 -93 357 166 288z"
                />
            </g>
        </svg>
    );
};

export function MenuIcon(props: Readonly<React.SVGProps<SVGSVGElement>>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
        </svg>
    );
}

export function CheckIcon(props: Readonly<React.SVGProps<SVGSVGElement>>) {
    return (
        <svg
            {...props}
            width="30"
            height="30"
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
            role="graphics-symbol"
            aria-labelledby="check-icon-title-id"
            aria-hidden="false"
            // fill="var(--lightmode-text)"
            // style="fill: var(--lightmode-text);"
        >
            <title id="check-icon-title-id">check icon</title>
            <path d="M8 16C3.6 16 0 12.4 0 8C0 3.6 3.6 0 8 0C12.4 0 16 3.6 16 8C16 12.4 12.4 16 8 16ZM8 1C4.15 1 1 4.15 1 8C1 11.85 4.15 15 8 15C11.85 15 15 11.85 15 8C15 4.15 11.85 1 8 1ZM11.4 6.45C11.6 6.25 11.6 5.95 11.4 5.75C11.2 5.55 10.9 5.55 10.7 5.75L6.4 10.05L4.85 8.5C4.65 8.3 4.3 8.3 4.15 8.5C4 8.7 4 9 4.15 9.2L6.05 11.1C6.25 11.3 6.55 11.3 6.75 11.1L11.4 6.45Z"></path>
        </svg>
    );
}

export const GoogleIcon = (props: Partial<IconProps>) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            {...props}
            viewBox="0 0 48 48"
        >
            <path
                fill="#FFC107"
                d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
            ></path>
            <path
                fill="#FF3D00"
                d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
            ></path>
            <path
                fill="#4CAF50"
                d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
            ></path>
            <path
                fill="#1976D2"
                d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
            ></path>
        </svg>
    );
};

export const PaypalIcon = (props: Partial<IconProps>) => {
    return (
        <svg
            fill="#000000"
            {...props}
            viewBox="0 0 512 512"
            id="Layer_1"
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M424.81,148.79c-.43,2.76-.93,5.58-1.49,8.48-19.17,98-84.76,131.8-168.54,131.8H212.13a20.67,20.67,0,0,0-20.47,17.46L169.82,444.37l-6.18,39.07a10.86,10.86,0,0,0,9.07,12.42,10.72,10.72,0,0,0,1.7.13h75.65a18.18,18.18,0,0,0,18-15.27l.74-3.83,14.24-90,.91-4.94a18.16,18.16,0,0,1,18-15.3h11.31c73.3,0,130.67-29.62,147.44-115.32,7-35.8,3.38-65.69-15.16-86.72A72.27,72.27,0,0,0,424.81,148.79Z" />
            <path d="M385.52,51.09C363.84,26.52,324.71,16,274.63,16H129.25a20.75,20.75,0,0,0-20.54,17.48l-60.55,382a12.43,12.43,0,0,0,10.39,14.22,12.58,12.58,0,0,0,1.94.15h89.76l22.54-142.29-.7,4.46a20.67,20.67,0,0,1,20.47-17.46h42.65c83.77,0,149.36-33.86,168.54-131.8.57-2.9,1.05-5.72,1.49-8.48h0C410.94,98.06,405.19,73.41,385.52,51.09Z" />
        </svg>
    );
};

export const BrowseIcon = (props: Partial<IconProps>) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <rect width="7" height="7" x="3" y="3" rx="1" />
            <rect width="7" height="7" x="14" y="3" rx="1" />
            <rect width="7" height="7" x="14" y="14" rx="1" />
            <rect width="7" height="7" x="3" y="14" rx="1" />
        </svg>
    );
};

export const SlackIcon = (_props: Partial<IconProps>) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-slack"
        >
            <rect width="3" height="8" x="13" y="2" rx="1.5"></rect>
            <path d="M19 8.5V10h1.5A1.5 1.5 0 1 0 19 8.5"></path>
            <rect width="3" height="8" x="8" y="14" rx="1.5"></rect>
            <path d="M5 15.5V14H3.5A1.5 1.5 0 1 0 5 15.5"></path>
            <rect width="8" height="3" x="14" y="13" rx="1.5"></rect>
            <path d="M15.5 19H14v1.5a1.5 1.5 0 1 0 1.5-1.5"></path>
            <rect width="8" height="3" x="2" y="8" rx="1.5"></rect>
            <path d="M8.5 5H10V3.5A1.5 1.5 0 1 0 8.5 5"></path>
        </svg>
    );
};

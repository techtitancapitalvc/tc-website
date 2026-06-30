/**
 * X (formerly Twitter) logo — design-ref SVG, 30×30 viewBox.
 * Solid black mark; no surrounding tile so it sits cleanly
 * alongside the LinkedIn / Gmail icons.
 */
export default function XIcon({
  className,
  ...rest
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 30 30"
      fill="none"
      className={className}
      {...rest}
    >
      <path
        d="M22.1094 3.82874L15.8644 10.9675L10.4644 3.82874H2.64062L11.9869 16.0487L3.12938 26.1725H6.92188L13.7581 18.36L19.7331 26.1725H27.3606L17.6181 13.2925L25.8994 3.82874H22.1094ZM20.7794 23.9037L7.06812 5.97749H9.32187L22.8794 23.9025L20.7794 23.9037Z"
        fill="black"
      />
    </svg>
  );
}

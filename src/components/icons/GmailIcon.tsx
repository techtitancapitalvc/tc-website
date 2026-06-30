/**
 * Gmail logo — design-ref SVG, 30×30 viewBox.
 * Multi-color brand mark on a soft-cream rounded background.
 */
export default function GmailIcon({
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
      <g clipPath="url(#gmail-icon-clip)">
        <path
          d="M22.9688 0H7.03125C3.148 0 0 3.148 0 7.03125V22.9688C0 26.852 3.148 30 7.03125 30H22.9688C26.852 30 30 26.852 30 22.9688V7.03125C30 3.148 26.852 0 22.9688 0Z"
          fill="#F4F2ED"
        />
        <path
          d="M4.87922 23.7936H8.60789V14.7382L3.28125 10.7433V22.1957C3.28125 23.0798 3.99773 23.7936 4.87922 23.7936Z"
          fill="#4285F4"
        />
        <path
          d="M21.3906 23.7936H25.1194C26.0036 23.7936 26.7174 23.0771 26.7174 22.1957V10.7432L21.3906 14.7382"
          fill="#34A853"
        />
        <path
          d="M21.3906 7.81344V14.7382L26.7174 10.7432V8.61231C26.7174 6.63618 24.4615 5.50954 22.8822 6.69477"
          fill="#FBBC04"
        />
        <path
          d="M8.60938 14.7382V7.81359L15.0014 12.6074L21.3934 7.81335V14.7381L15.0014 19.5322"
          fill="#EA4335"
        />
        <path
          d="M3.28125 8.61243V10.7431L8.60789 14.7382V7.81357L7.11645 6.69489C5.53441 5.50966 3.28125 6.6363 3.28125 8.61243Z"
          fill="#C5221F"
        />
      </g>
      <defs>
        <clipPath id="gmail-icon-clip">
          <rect width="30" height="30" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

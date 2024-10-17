import Link from "next/link";

export default function Footer() {
  return (
    <footer className="flex flex-col justify-center w-full px-4 mx-0 my-4 space-y-1 text-sm md:max-w-3xl md:my-12 md:mx-auto sm:px-6 md:h-5 md:items-center md:space-y-0 md:space-x-4 md:flex-row">
      <Link
        href="https://yuorei.com"
        target="_blank"
        className="hover:text-blue-500"
      >
        ユオレイ
      </Link>
      <Link
        href="https://twitter.com/yuorei71"
        target="_blank"
        className="hover:text-blue-500"
      >
        @yuorei71
      </Link>
      <Link
        href="https://github.com/yuorei/video-server"
        target="_blank"
        className="hover:text-blue-500"
      >
        Source on GitHub
      </Link>
      <Link
        href="https://yuovision.yuorei.com"
        target="_blank"
        className="hover:text-blue-500"
      >
        YuoVision
      </Link>
    </footer>
  );
}

import Link from 'next/link'

export default function NavigationBar() {
    return (
        <nav class="flex justify-center fixed w-full bg-gray-100 px-8 py-2 shadow-md z-10">
          <Link href="/static-generated-page">
            <a class="no-underline uppercase rounded hover:bg-gray-300 focus:bg-gray-400 focus:outline-none tracking-wide font-bold text-xs py-3 mr-8" href="#">
              Load static generated dpkg set
            </a>
          </Link>
          <Link href="server-side-rendered-page">
            <a class="no-underline uppercase rounded hover:bg-gray-300 focus:bg-gray-400 focus:outline-none tracking-wide font-bold text-xs py-3 mr-8" href="#">
              Load server side rendered dpkg set
            </a>
          </Link>
        </nav>
    )
  }
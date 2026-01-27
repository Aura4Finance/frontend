import { Link } from "wouter";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-linear-to-b from-blue-950 to-black text-white px-6">
      <h1 className="text-8xl font-bold mb-4">404</h1>
      <p className="text-xl mb-6 text-gray-300">Oops! The page you’re looking for doesn’t exist.</p>
      <Link href="/">
        <a className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-full transition-colors">
          Go Back Home
        </a>
      </Link>
    </div>
  );
};

export default NotFound;

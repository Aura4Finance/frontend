import { Link } from "react-router-dom";
import { RiArrowLeftLine, RiArrowRightLine, RiTimeLine } from "react-icons/ri";
import { blogPosts } from "../blog";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function BlogList() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white text-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-10"
          >
            <RiArrowLeftLine size={16} />
            Back to home
          </Link>

          <div className="mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
              Engineering Blog
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl">
              Deep technical writing from the ORAFI engineering team — cryptography,
              distributed systems, blockchain infrastructure, and security.
            </p>
          </div>

          <div className="space-y-6">
            {blogPosts.map((post) => (
              <Link
                key={post.slug}
                to={`/blogs/${post.slug}`}
                className="group block p-6 rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all duration-200"
              >
                <div className="flex items-center gap-3 mb-3">
                  {post.coverLabel && (
                    <span className="px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[#2563eb] bg-blue-50 rounded-full">
                      {post.coverLabel}
                    </span>
                  )}
                  <span className="text-xs text-slate-400">{post.date}</span>
                </div>

                <h2 className="text-xl font-bold text-slate-900 group-hover:text-[#2563eb] transition-colors mb-2">
                  {post.title}
                </h2>

                <p className="text-sm text-slate-500 leading-relaxed mb-4">
                  {post.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-slate-500 font-medium">
                      {post.author}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <RiTimeLine size={12} />
                      {post.readingTime}
                    </span>
                  </div>

                  <span className="flex items-center gap-1 text-sm font-medium text-[#2563eb] opacity-0 group-hover:opacity-100 transition-opacity">
                    Read <RiArrowRightLine size={14} />
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-4">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-[10px] font-medium text-slate-500 bg-slate-50 border border-slate-100 rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>

          {blogPosts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-slate-400 text-lg">No posts yet. Check back soon.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

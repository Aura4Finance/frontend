import { useParams, Link } from "react-router-dom";
import { RiArrowLeftLine, RiTimeLine, RiCalendarLine } from "react-icons/ri";
import { getBlogBySlug } from "../blog";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function BlogDetail() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getBlogBySlug(slug) : undefined;

  if (!post) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Post not found</h1>
            <p className="text-slate-500 mb-6">
              The blog post you're looking for doesn't exist.
            </p>
            <Link
              to="/blogs"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#2563eb] rounded-lg hover:bg-[#1d4ed8] transition-colors"
            >
              <RiArrowLeftLine size={16} />
              Back to blog
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const Content = post.content;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white text-slate-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
          <Link
            to="/blogs"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-10"
          >
            <RiArrowLeftLine size={16} />
            All posts
          </Link>

          {/* Header */}
          <header className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              {post.coverLabel && (
                <span className="px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[#2563eb] bg-blue-50 rounded-full">
                  {post.coverLabel}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight mb-4">
              {post.title}
            </h1>

            <p className="text-lg text-slate-500 leading-relaxed mb-6">
              {post.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 pb-6 border-b border-slate-200">
              <span className="font-medium text-slate-900">{post.author}</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-400">{post.authorRole}</span>
              <span className="text-slate-300">|</span>
              <span className="flex items-center gap-1">
                <RiCalendarLine size={14} />
                {post.date}
              </span>
              <span className="flex items-center gap-1">
                <RiTimeLine size={14} />
                {post.readingTime}
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
          </header>

          {/* Article body */}
          <div className="blog-content">
            <Content />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

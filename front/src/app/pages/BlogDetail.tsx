import { ArrowLeft, Calendar, Clock, Share2, Tag, User } from "lucide-react";
import { motion } from "motion/react";
import { Link, useParams } from "react-router";
import { Button } from "../components/Button";
import { BlogNewsletter } from "../components/blogs/BlogNewsletter";
import { BlogPostCard } from "../components/blogs/BlogPostCard";
import { blogPosts } from "../data/blogs";

/* ------------------------------------------------------------------ */
/*  Minimal Markdown Renderer                                         */
/* ------------------------------------------------------------------ */

type AlertType = "green" | "yellow" | "red" | "urgent" | null;

const alertStyles: Record<
  Exclude<AlertType, null>,
  { bg: string; border: string; heading: string; icon: string }
> = {
  green: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    heading: "text-emerald-700",
    icon: "🟢",
  },
  yellow: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    heading: "text-yellow-700",
    icon: "🟡",
  },
  red: {
    bg: "bg-red-50",
    border: "border-red-200",
    heading: "text-red-700",
    icon: "🔴",
  },
  urgent: {
    bg: "bg-red-50",
    border: "border-red-300",
    heading: "text-red-800",
    icon: "🚨",
  },
};

function detectAlertType(line: string): AlertType {
  if (line.includes("🟢")) return "green";
  if (line.includes("🟡")) return "yellow";
  if (line.includes("🔴")) return "red";
  if (line.includes("🚨")) return "urgent";
  return null;
}

function renderMarkdown(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let listType: "ul" | "ol" | null = null;
  let currentAlert: AlertType = null;
  let alertHeading = "";
  let alertItems: string[] = [];

  const inlineFormat = (text: string): string => {
    return text
      .replace(
        /\*\*(.+?)\*\*/g,
        '<strong class="font-semibold text-gray-900">$1</strong>',
      )
      .replace(/\*(.+?)\*/g, "<em>$1</em>");
  };

  const flushList = () => {
    if (listItems.length > 0 && listType) {
      const ListTag = listType === "ol" ? "ol" : "ul";
      elements.push(
        <ListTag
          key={`list-${elements.length}`}
          className={`mb-6 space-y-2 text-gray-700 leading-relaxed ${
            listType === "ol" ? "list-decimal" : "list-disc"
          } pl-6`}
        >
          {listItems.map((item, j) => (
            <li
              key={j}
              dangerouslySetInnerHTML={{ __html: inlineFormat(item) }}
            />
          ))}
        </ListTag>,
      );
      listItems = [];
      listType = null;
    }
  };

  const flushAlert = () => {
    if (currentAlert && alertItems.length > 0) {
      const style = alertStyles[currentAlert];
      elements.push(
        <div
          key={`alert-${elements.length}`}
          className={`${style.bg} ${style.border} border rounded-2xl p-6 mb-8`}
        >
          <h3
            className={`text-lg font-bold ${style.heading} mb-4 flex items-center gap-2`}
          >
            <span>{style.icon}</span>
            {alertHeading}
          </h3>
          <ul className="space-y-2">
            {alertItems.map((item, j) => (
              <li
                key={j}
                className="flex items-start gap-2 text-gray-700"
                dangerouslySetInnerHTML={{
                  __html: `<span class="mt-1.5 w-1.5 h-1.5 rounded-full ${
                    currentAlert === "green" ? "bg-emerald-400" : currentAlert === "yellow" ? "bg-yellow-400" : "bg-red-400"
                  } flex-shrink-0 inline-block"></span><span>${inlineFormat(item)}</span>`,
                }}
              />
            ))}
          </ul>
        </div>,
      );
      currentAlert = null;
      alertHeading = "";
      alertItems = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect alert-type headings (🟢, 🟡, 🔴, 🚨)
    if (line.startsWith("## ") && detectAlertType(line)) {
      flushList();
      flushAlert();
      currentAlert = detectAlertType(line);
      // Strip the ## and emoji from the heading text
      alertHeading = line
        .slice(3)
        .replace(/🟢|🟡|🔴|🚨/g, "")
        .trim();
      continue;
    }

    // If inside an alert section, collect list items
    if (currentAlert !== null) {
      if (line.match(/^- /)) {
        alertItems.push(line.slice(2));
        continue;
      }
      if (line.trim() === "") continue;
      // Non-list line inside alert — treat as paragraph within alert
      if (!line.startsWith("## ") && !line.startsWith("### ")) {
        alertItems.push(line);
        continue;
      }
      // A new heading — flush the alert first
      flushAlert();
    }

    // Headings
    if (line.startsWith("### ")) {
      flushList();
      elements.push(
        <h3 key={i} className="text-xl font-bold text-gray-900 mt-8 mb-3">
          {line.slice(4)}
        </h3>,
      );
    } else if (line.startsWith("## ")) {
      flushList();
      elements.push(
        <h2 key={i} className="text-2xl font-bold text-gray-900 mt-10 mb-4">
          {line.slice(3)}
        </h2>,
      );
    }
    // Unordered list
    else if (line.match(/^- /)) {
      if (listType !== "ul") flushList();
      listType = "ul";
      listItems.push(line.slice(2));
    }
    // Ordered list
    else if (line.match(/^\d+\.\s/)) {
      if (listType !== "ol") flushList();
      listType = "ol";
      listItems.push(line.replace(/^\d+\.\s/, ""));
    }
    // Empty line
    else if (line.trim() === "") {
      flushList();
    }
    // Paragraph
    else {
      flushList();
      elements.push(
        <p
          key={i}
          className="text-gray-700 leading-relaxed mb-4 text-lg"
          dangerouslySetInnerHTML={{ __html: inlineFormat(line) }}
        />,
      );
    }
  }

  flushList();
  flushAlert();
  return elements;
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function BlogDetail() {
  const { id } = useParams<{ id: string }>();
  const post = blogPosts.find((p) => p.id === Number(id));

  // Related posts — same category, exclude current
  const relatedPosts = blogPosts
    .filter((p) => p.id !== post?.id && p.category === post?.category)
    .slice(0, 3);

  // If no same-category, show other posts
  const suggestions =
    relatedPosts.length > 0
      ? relatedPosts
      : blogPosts.filter((p) => p.id !== post?.id).slice(0, 3);

  if (!post) {
    return (
      <div className="pt-32 pb-20 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold mb-4 text-gray-800">
            Article Not Found
          </h1>
          <p className="text-gray-500 mb-8">
            The blog post you're looking for doesn't exist.
          </p>
          <Button to="/blogs" size="md">
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div>
      {/* ── Hero Banner ── */}
      <section className="relative h-[420px] md:h-[500px] overflow-hidden">
        <motion.img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />

        {/* Back button */}
        <motion.div
          className="absolute top-24 left-6 md:left-12 z-10"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-full text-sm font-medium hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </motion.div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="max-w-4xl mx-auto">
            <motion.span
              className="inline-block px-3 py-1.5 bg-gradient-to-r from-[#3FA9F5] to-[#1F6FEB] text-white rounded-full text-xs font-semibold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {post.category}
            </motion.span>

            <motion.h1
              className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.7 }}
            >
              {post.title}
            </motion.h1>

            <motion.div
              className="flex flex-wrap items-center gap-4 text-white/80 text-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <span className="flex items-center gap-1.5">
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-white" />
                </div>
                {post.author}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {post.date}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {post.readTime}
              </span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Article Body ── */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Tags + Share */}
          <motion.div
            className="flex flex-wrap items-center justify-between gap-4 mb-10 pb-8 border-b border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#3FA9F5]/10 text-[#3FA9F5] rounded-full text-xs font-medium"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
            <button className="inline-flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-[#3FA9F5] border border-gray-200 hover:border-[#3FA9F5] rounded-full text-sm transition-colors">
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </motion.div>

          {/* Content */}
          <motion.article
            className="prose-custom"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.7 }}
          >
            {renderMarkdown(post.content)}
          </motion.article>

          {/* Author Card */}
          <motion.div
            className="mt-14 p-6 md:p-8 bg-gradient-to-br from-blue-50 to-white rounded-3xl border border-blue-100"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#3FA9F5] to-[#1F6FEB] flex items-center justify-center flex-shrink-0">
                <User className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{post.author}</p>
                <p className="text-sm text-[#3FA9F5] font-medium">
                  {post.authorRole}
                </p>
              </div>
            </div>
            <p className="mt-4 text-gray-600 leading-relaxed">
              Contributing author at Ora AI, sharing expert insights on dental
              health, AI technology, and preventive care.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Related Posts ── */}
      {suggestions.length > 0 && (
        <section className="py-16 px-6 bg-gradient-to-br from-blue-50/50 to-white">
          <div className="max-w-7xl mx-auto">
            <motion.h2
              className="text-3xl font-bold mb-10"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              You Might Also Like
            </motion.h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {suggestions.map((p, i) => (
                <BlogPostCard key={p.id} post={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      <BlogNewsletter />
    </div>
  );
}

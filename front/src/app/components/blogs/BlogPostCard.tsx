import { ArrowRight, Calendar, Clock, Tag, User } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router";
import type { BlogPost } from "../../data/blogs";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" },
  }),
};

interface BlogPostCardProps {
  post: BlogPost;
  index: number;
}

export function BlogPostCard({ post, index }: BlogPostCardProps) {
  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <Link to={`/blogs/${post.id}`} className="block h-full">
      <div className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 h-full flex flex-col">
        {/* Thumbnail */}
        <div className="relative h-52 overflow-hidden">
          <motion.img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.07 }}
            transition={{ duration: 0.5 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <span className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm text-[#1F6FEB] rounded-full text-xs font-semibold">
            {post.category}
          </span>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col flex-1">
          <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {post.date}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {post.readTime}
            </span>
          </div>

          <h3 className="text-xl font-bold mb-2 group-hover:text-[#3FA9F5] transition-colors leading-snug">
            {post.title}
          </h3>

          <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-1">
            {post.excerpt}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#3FA9F5]/8 text-[#3FA9F5] rounded-lg text-xs font-medium"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#3FA9F5] to-[#1F6FEB] flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-xs font-medium text-gray-700">
                {post.author}
              </span>
            </div>
            <motion.span
              className="flex items-center gap-1 text-[#3FA9F5] font-medium text-xs cursor-pointer"
              whileHover={{ x: 3 }}
            >
              Read
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.span>
          </div>
        </div>
      </div>
      </Link>
    </motion.div>
  );
}

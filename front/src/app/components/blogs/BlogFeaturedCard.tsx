import { ArrowRight, Calendar, Clock, User } from "lucide-react";
import { motion, Variants } from "motion/react";
import { Link } from "react-router";
import type { BlogPost } from "../../data/blogs";

const slideFromLeft: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

const slideFromRight: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

interface BlogFeaturedCardProps {
  post: BlogPost;
  index: number;
}

export function BlogFeaturedCard({ post, index }: BlogFeaturedCardProps) {
  return (
    <motion.div
      variants={index === 0 ? slideFromLeft : slideFromRight}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <Link to={`/blogs/${post.id}`} className="block h-full">
        <div className="group relative rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-500 bg-white h-full">
          {/* Image */}
          <div className="relative h-64 overflow-hidden">
            <motion.img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.6 }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <span className="absolute top-4 left-4 px-3 py-1.5 bg-white/90 backdrop-blur-sm text-[#1F6FEB] rounded-full text-xs font-semibold">
              {post.category}
            </span>
            <span className="absolute top-4 right-4 px-3 py-1.5 bg-gradient-to-r from-[#3FA9F5] to-[#1F6FEB] text-white rounded-full text-xs font-semibold">
              Featured
            </span>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {post.date}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {post.readTime}
              </span>
            </div>
            <h3 className="text-2xl font-bold mb-3 group-hover:text-[#3FA9F5] transition-colors">
              {post.title}
            </h3>
            <p className="text-gray-600 leading-relaxed mb-4">{post.excerpt}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3FA9F5] to-[#1F6FEB] flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {post.author}
                  </p>
                  <p className="text-xs text-gray-500">{post.authorRole}</p>
                </div>
              </div>
              <motion.span
                className="flex items-center gap-1 text-[#3FA9F5] font-medium text-sm cursor-pointer"
                whileHover={{ x: 4 }}
              >
                Read More
                <ArrowRight className="w-4 h-4" />
              </motion.span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

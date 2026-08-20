import { BookOpen, Search, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { BlogCategoryFilter } from "../components/blogs/BlogCategoryFilter";
import { BlogFeaturedCard } from "../components/blogs/BlogFeaturedCard";
import { BlogHero } from "../components/blogs/BlogHero";
import { BlogNewsletter } from "../components/blogs/BlogNewsletter";
import { BlogPostCard } from "../components/blogs/BlogPostCard";
import { blogCategories, blogPosts } from "../data/blogs";

export default function Blogs() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = blogPosts.filter((post) => {
    const matchesCategory =
      activeCategory === "All" || post.category === activeCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPosts = blogPosts.filter((p) => p.featured);

  return (
    <div>
      <BlogHero searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <BlogCategoryFilter
        categories={blogCategories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* ── Featured Posts ── */}
      {activeCategory === "All" && searchQuery === "" && (
        <section className="px-6 pb-20">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="flex items-center gap-3 mb-10"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-[#3FA9F5] to-[#1F6FEB] rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-3xl font-bold">Featured Articles</h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {featuredPosts.map((post, i) => (
                <BlogFeaturedCard key={post.id} post={post} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── All Posts Grid ── */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-50/50 to-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="flex items-center gap-3 mb-10"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-[#3FA9F5] to-[#1F6FEB] rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-3xl font-bold">
              {activeCategory === "All" ? "All Articles" : activeCategory}
            </h2>
            <span className="ml-auto text-sm text-gray-500">
              {filteredPosts.length} article
              {filteredPosts.length !== 1 ? "s" : ""}
            </span>
          </motion.div>

          {filteredPosts.length === 0 ? (
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-400 mb-2">
                No articles found
              </h3>
              <p className="text-gray-400">
                Try adjusting your search or category filter.
              </p>
            </motion.div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post, i) => (
                <BlogPostCard key={post.id} post={post} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      <BlogNewsletter />
    </div>
  );
}

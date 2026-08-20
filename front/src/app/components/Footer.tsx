import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { Link } from "react-router";
import Logo from "./Logo";

const SOCIAL_LINKS = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
];

const FOOTER_LINKS = {
  product: [
    { label: "Features", href: "/features" },
    { label: "AI Tool", href: "/ai-tool" },
    { label: "Blogs", href: "/blogs" },
  ],
  company: [{ label: "About", href: "/about" }],
};

const LINK_CLASS =
  "text-gray-600 hover:text-[#3FA9F5] text-sm transition-colors";
const SOCIAL_ICON_CLASS =
  "w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-[#3FA9F5] hover:bg-[#3FA9F5] hover:text-white transition-colors";

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-50 to-blue-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div>
            <Logo />
            <p className="text-gray-600 text-sm">
              AI-powered dental health analysis for everyone.
            </p>
          </div>

          <FooterSection title="Product" links={FOOTER_LINKS.product} />
          <FooterSection title="Company" links={FOOTER_LINKS.company} />
        </div>

        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 text-sm">
            © 2026 Ora AI. All rights reserved.
          </p>
          <div className="flex gap-4">
            {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                className={SOCIAL_ICON_CLASS}
                aria-label={label}
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterSection({
  title,
  links,
}: {
  title: string;
  links: Array<{ label: string; href: string }>;
}) {
  return (
    <div>
      <h4 className="font-semibold mb-4 text-gray-900">{title}</h4>
      <ul className="space-y-2">
        {links.map(({ label, href }) => (
          <li key={href}>
            <Link to={href} className={LINK_CLASS}>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Linkedin, Github } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-[#E0E0E0] py-8 mt-auto hidden md:block">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-base font-semibold mb-4 text-[#191919]">Hindustan Founders Network</h3>
            <p className="text-[#666666] text-sm mb-4">
              Connecting founders, investors, and professionals across India to build the next generation of startups.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-[#666666] hover:text-[#0077B5]">
                <Facebook size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-[#666666] hover:text-[#0077B5]">
                <Twitter size={20} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-[#666666] hover:text-[#0077B5]">
                <Instagram size={20} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-[#666666] hover:text-[#0077B5]">
                <Linkedin size={20} />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-[#666666] hover:text-[#0077B5]">
                <Github size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-base font-semibold mb-3 text-[#191919]">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-[#666666] hover:text-[#0077B5] hover:underline text-sm">Home</Link>
              </li>
              <li>
                <Link href="/network" className="text-[#666666] hover:text-[#0077B5] hover:underline text-sm">Network</Link>
              </li>
              <li>
                <Link href="/messages" className="text-[#666666] hover:text-[#0077B5] hover:underline text-sm">Messages</Link>
              </li>
              <li>
                <Link href="/pitch-room" className="text-[#666666] hover:text-[#0077B5] hover:underline text-sm">Pitch Room</Link>
              </li>
              <li>
                <Link href="/jobs" className="text-[#666666] hover:text-[#0077B5] hover:underline text-sm">Jobs</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-base font-semibold mb-3 text-[#191919]">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-[#666666] hover:text-[#0077B5] hover:underline text-sm">About Us</Link>
              </li>
              <li>
                <Link href="/articles" className="text-[#666666] hover:text-[#0077B5] hover:underline text-sm">Articles</Link>
              </li>
              <li>
                <Link href="/events" className="text-[#666666] hover:text-[#0077B5] hover:underline text-sm">Events</Link>
              </li>
              <li>
                <Link href="/investor-relations" className="text-[#666666] hover:text-[#0077B5] hover:underline text-sm">Investor Relations</Link>
              </li>
              <li>
                <Link href="/startup-resources" className="text-[#666666] hover:text-[#0077B5] hover:underline text-sm">Startup Resources</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-base font-semibold mb-3 text-[#191919]">Contact</h3>
            <ul className="space-y-2">
              <li className="text-[#666666] text-sm">
                <strong className="text-[#191919]">Email:</strong> info@hindustanfounders.com
              </li>
              <li className="text-[#666666] text-sm">
                <strong className="text-[#191919]">Address:</strong> 123 Startup Street, Mumbai, India
              </li>
              <li>
                <Link href="/support" className="text-[#666666] hover:text-[#0077B5] hover:underline text-sm">Support</Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-[#666666] hover:text-[#0077B5] hover:underline text-sm">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/cookie-policy" className="text-[#666666] hover:text-[#0077B5] hover:underline text-sm">Cookie Policy</Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="text-[#666666] hover:text-[#0077B5] hover:underline text-sm">Terms of Service</Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-[#E0E0E0] mt-8 pt-6 text-center">
          <p className="text-[#666666] text-sm">
            © {currentYear} Hindustan Founders Network. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

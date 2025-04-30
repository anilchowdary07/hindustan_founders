import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Linkedin, Github } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Hindustan Founders Network</h3>
            <p className="text-gray-600 text-sm mb-4">
              Connecting founders, investors, and professionals across India to build the next generation of startups.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary">
                <Facebook size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary">
                <Twitter size={20} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary">
                <Instagram size={20} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary">
                <Linkedin size={20} />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary">
                <Github size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-600 hover:text-primary">Home</Link>
              </li>
              <li>
                <Link href="/network" className="text-gray-600 hover:text-primary">Network</Link>
              </li>
              <li>
                <Link href="/messages" className="text-gray-600 hover:text-primary">Messages</Link>
              </li>
              <li>
                <Link href="/pitch-room" className="text-gray-600 hover:text-primary">Pitch Room</Link>
              </li>
              <li>
                <Link href="/jobs" className="text-gray-600 hover:text-primary">Jobs</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-600 hover:text-primary">About Us</Link>
              </li>
              <li>
                <Link href="/articles" className="text-gray-600 hover:text-primary">Articles</Link>
              </li>
              <li>
                <Link href="/events" className="text-gray-600 hover:text-primary">Events</Link>
              </li>
              <li>
                <Link href="/network" className="text-gray-600 hover:text-primary">Investor Relations</Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 hover:text-primary">Startup Resources</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="text-gray-600">
                <strong>Email:</strong> info@hindustanfounders.com
              </li>
              <li className="text-gray-600">
                <strong>Address:</strong> 123 Startup Street, Mumbai, India
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-primary">Support</Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-gray-600 hover:text-primary">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-gray-600 hover:text-primary">Terms of Service</Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-6 text-center">
          <p className="text-gray-600 text-sm">
            © {currentYear} Hindustan Founders Network. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 py-10 mt-20">
      <div className="container mx-auto flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-foreground/60">© 2025 Personalized Learning Path Generator (SIH25199)</p>
        <div className="flex items-center gap-4 text-sm">
          <Link to="/about" className="text-foreground/70 hover:text-foreground">About</Link>
          <Link to="/contact" className="text-foreground/70 hover:text-foreground">Contact</Link>
          <Link to="/privacy" className="text-foreground/70 hover:text-foreground">Privacy Policy</Link>
        </div>
      </div>
    </footer>
  );
}

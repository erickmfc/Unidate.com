import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Mail, 
  MapPin, 
  Github,
  Linkedin,
  Instagram,
  Twitter
} from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    produto: [
      { name: 'Recursos', href: '/features' },
      { name: 'Preços', href: '/pricing' },
      { name: 'API', href: '/api' },
      { name: 'Status', href: '/status' }
    ],
    empresa: [
      { name: 'Sobre Nós', href: '/about' },
      { name: 'Carreiras', href: '/careers' },
      { name: 'Imprensa', href: '/press' },
      { name: 'Blog', href: '/blog' }
    ],
    suporte: [
      { name: 'Central de Ajuda', href: '/help' },
      { name: 'Contato', href: '/contact' },
      { name: 'Comunidade', href: '/community' },
      { name: 'Reportar Bug', href: '/bug-report' }
    ],
    legal: [
      { name: 'Termos de Uso', href: '/terms' },
      { name: 'Privacidade', href: '/privacy' },
      { name: 'Cookies', href: '/cookies' },
      { name: 'Licenças', href: '/licenses' },
      { name: 'Admin', href: '/admin' }
    ]
  };

  const socialLinks = [
    { name: 'GitHub', icon: Github, href: 'https://github.com/unidate' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/company/unidate' },
    { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/unidate' },
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/unidate' }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid lg:grid-cols-5 gap-8 mb-12">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            <p className="text-gray-300 mb-6 max-w-md">
              UniDate é a plataforma social exclusiva para estudantes universitários. 
              Conectamos pessoas, criamos comunidades e transformamos a experiência acadêmica.
            </p>
            
            {/* Made by Students Badge */}
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-500 to-accent-500 px-4 py-2 rounded-full">
              <Heart className="h-4 w-4 text-white" />
              <span className="text-sm font-medium">Feito por estudantes, para estudantes</span>
            </div>

            {/* Contact Info */}
            <div className="mt-8 space-y-3">
              <div className="flex items-center space-x-3 text-gray-300">
                <Mail className="h-4 w-4" />
                <span>contato@unidate.com</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <MapPin className="h-4 w-4" />
                <span>São Paulo, SP - Brasil</span>
              </div>
            </div>
          </div>

          {/* Links Sections */}
          <div className="lg:col-span-3 grid md:grid-cols-4 gap-8">
            {/* Produto */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Produto</h3>
              <ul className="space-y-3">
                {footerLinks.produto.map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.href}
                      className="text-gray-300 hover:text-white transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Empresa */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Empresa</h3>
              <ul className="space-y-3">
                {footerLinks.empresa.map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.href}
                      className="text-gray-300 hover:text-white transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Suporte */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Suporte</h3>
              <ul className="space-y-3">
                {footerLinks.suporte.map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.href}
                      className="text-gray-300 hover:text-white transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.href}
                      className="text-gray-300 hover:text-white transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl p-8 mb-12">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Fique por dentro das novidades!</h3>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Receba atualizações sobre novos recursos, eventos do campus e dicas para aproveitar ao máximo sua vida universitária.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Seu e-mail"
                className="flex-1 px-4 py-3 rounded-xl border-0 focus:ring-4 focus:ring-white/20 transition-all duration-200"
              />
              <button className="bg-white text-primary-600 font-semibold px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                Inscrever-se
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            {/* Copyright */}
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © {currentYear} UniDate. Todos os direitos reservados.
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-6">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Made with Love */}
          <div className="text-center mt-6 pt-6 border-t border-gray-800">
            <p className="text-gray-400 text-sm">
              Feito com <Heart className="inline h-4 w-4 text-red-500" /> por estudantes brasileiros
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


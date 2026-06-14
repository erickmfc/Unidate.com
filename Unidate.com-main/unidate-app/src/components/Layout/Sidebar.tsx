import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Heart, 
  Users, 
  MessageCircle, 
  Calendar, 
  MapPin,
  Rocket,
  Plus
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  onHashtagClick?: (hashtag: string) => void;
  activeHashtag?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ onHashtagClick, activeHashtag }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  const menuItems = [
    { name: 'Home', href: '/feed', icon: Home },
    { name: 'Descoberta', href: '/discover', icon: Heart },
    { name: 'Grupos', href: '/groups', icon: Users },
    { name: 'Bate-papo', href: '/chat', icon: MessageCircle },
    { name: 'Eventos', href: '/events', icon: Calendar },
    { name: 'Guia do Campus', href: '/campus-guide', icon: MapPin },
  ];

  const shortcuts = [
    { name: 'TeVi', color: 'text-pink-500' },
    { name: 'Calculo01', color: 'text-indigo-500' },
    { name: 'BiblioTecA', color: 'text-emerald-500' },
    { name: 'FestaDoDireito', color: 'text-blue-500' },
    { name: 'CorredorB', color: 'text-purple-500' },
  ];

  const handleShortcutClick = (hashtagName: string) => {
    if (onHashtagClick) {
      onHashtagClick(hashtagName);
    } else {
      // Se não estivermos na página de Feed, vai para o Feed passando o hashtag como filtro
      navigate(`/feed?tag=${hashtagName}`);
    }
  };

  return (
    <aside className="w-64 fixed left-0 top-0 bottom-0 bg-white border-r border-gray-100 flex flex-col justify-between py-6 px-4 z-40 overflow-y-auto">
      {/* Top Section */}
      <div className="flex flex-col space-y-8">
        {/* Logo */}
        <div className="flex items-center space-x-3 px-3">
          <div className="h-10 w-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-100">
            U
          </div>
          <span className="font-extrabold text-xl tracking-wide bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            UniVerso<span className="text-pink-500 font-medium">+</span>
          </span>
        </div>

        {/* Navigation Menu */}
        <nav className="flex flex-col space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 font-medium
                  ${isActive 
                    ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-lg shadow-purple-100' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
                `}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Shortcuts Section */}
        <div className="flex flex-col space-y-3 pt-4 border-t border-gray-50">
          <div className="flex justify-between items-center px-3">
            <span className="text-xs font-semibold text-gray-400 tracking-wider uppercase">Atalhos</span>
            <button className="text-gray-400 hover:text-gray-600">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-col space-y-1">
            {shortcuts.map((shortcut) => {
              const isSelected = activeHashtag === shortcut.name;
              return (
                <button
                  key={shortcut.name}
                  onClick={() => handleShortcutClick(shortcut.name)}
                  className={`
                    flex items-center space-x-3 px-4 py-2 rounded-xl text-left transition-all duration-200 font-medium text-sm
                    ${isSelected 
                      ? 'bg-purple-50 text-indigo-700' 
                      : 'text-gray-600 hover:bg-gray-50'}
                  `}
                >
                  <span className={`${shortcut.color} font-bold text-base`}>#</span>
                  <span className="truncate">{shortcut.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Boost Card */}
      <div className="mt-8">
        <div className="bg-gradient-to-br from-violet-600 to-pink-500 rounded-3xl p-5 text-white shadow-xl shadow-purple-100 relative overflow-hidden group">
          {/* Decorative Background Rocket Graphic */}
          <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4 transition-transform group-hover:translate-x-2 group-hover:translate-y-2 duration-500">
            <Rocket className="h-32 w-32" />
          </div>
          
          <h4 className="font-extrabold text-lg leading-tight mb-2">Impulsione seu campus</h4>
          <p className="text-xs text-purple-100 leading-relaxed mb-4">
            Conecte, compartilhe e transforme sua jornada acadêmica.
          </p>
          
          <Link
            to="/impulsionar"
            className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 transition-all duration-300 shadow-sm"
          >
            <span>Explorar agora</span>
            <span>&rarr;</span>
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

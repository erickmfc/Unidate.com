import React from 'react';
import { User, Award, BookOpen } from 'lucide-react';
import StatueBust from './StatueBust';

interface Expert {
  id: string;
  name: string;
  title: string;
  expertise: string[];
  image?: string;
  bio?: string;
}

interface ExpertCardProps {
  expert: Expert;
  onClick?: () => void;
}

const ExpertCard: React.FC<ExpertCardProps> = ({ expert, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 hover:border-yellow-400 transition-all duration-300 cursor-pointer group"
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <StatueBust size="medium" variant="gold" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <User className="h-5 w-5 text-yellow-400" />
            <h3 className="text-lg font-serif text-yellow-400">{expert.name}</h3>
          </div>
          
          <p className="text-gray-400 text-sm mb-3">{expert.title}</p>
          
          {expert.bio && (
            <p className="text-gray-300 text-sm mb-4 line-clamp-2">{expert.bio}</p>
          )}
          
          <div className="flex flex-wrap gap-2">
            {expert.expertise.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-xs"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertCard;

